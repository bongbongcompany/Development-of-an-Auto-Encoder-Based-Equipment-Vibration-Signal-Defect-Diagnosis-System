import os
from pathlib import Path
import pandas as pd
import numpy as np
import hashlib
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from ai_assets.inference import NutPredictor
from ai_assets.mlops import run_retraining
from fastapi.middleware.cors import CORSMiddleware 
import uvicorn
from io import BytesIO
from scipy.stats import ks_2samp  # 분포 분석용 추가

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CURRENT_DIR = Path(__file__).parent 
BASE_PATH = CURRENT_DIR / "ai_assets" 
STORAGE_PATH = BASE_PATH / "validated_data"
MODEL_DIR = BASE_PATH / "RPM_model" 
DATA_DIR = BASE_PATH / "data_proc_rpm"

MONGO_DETAILS = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_DETAILS)
db = client.nutdb 
model_inputs_col = db.model_inputs 
model_configs_col = db.model_configs 

predictor = NutPredictor(base_model_dir=str(MODEL_DIR), base_data_dir=str(DATA_DIR))

# --- 유틸리티 로직 ---

def get_sha256(content: bytes):
    return hashlib.sha256(content).hexdigest()

async def trigger_retraining_if_needed(rpm: str, current_error: float):
    """
    MLOps: 재학습 트리거 조건
    1. 데이터가 정확히 100개 쌓였을 때 (OR)
    2. 최근 100개 데이터에서 3가지 지표(분산, TCR, Shape) 이상이 모두 포착되었을 때
    """
    # 현재까지 쌓인 전체 데이터 수 확인
    total_count = await model_inputs_col.count_documents({"rpm": rpm})
    
    # 조건 A: 데이터가 100개 쌓인 시점 (100, 200, 300...)
    is_count_trigger = total_count > 0 and total_count % 100 == 0

    # 조건 B: 3가지 성능 지표 이상 포착 여부 확인
    is_performance_trigger = False
    if total_count >= 100:
        cursor = model_inputs_col.find({"rpm": rpm}).sort("created_at", -1).limit(100)
        recent_docs = await cursor.to_list(length=100)
        errors = np.array([doc.get("error_val", 0) for doc in recent_docs])

        # 1. 오차 분산 커짐
        is_var_high = np.var(errors) > 1.5 
        # 2. Threshold Crossing Rate (TCR) 변화 (오차 0.5 초과 비율)
        is_tcr_high = np.mean(errors > 0.5) > 0.2
        # 3. Error Distribution Shape 붕괴 (초기 데이터와 현재 데이터 분포 비교)
        first_docs = await model_inputs_col.find({"rpm": rpm}).sort("created_at", 1).limit(100).to_list(length=100)
        base_errors = np.array([doc.get("error_val", 0) for doc in first_docs])
        _, p_value = ks_2samp(base_errors, errors)
        is_shape_collapsed = p_value < 0.05

        # 3개 조건이 모두 포착되어야 성능 기반 트리거 작동
        if is_var_high and is_tcr_high and is_shape_collapsed:
            is_performance_trigger = True

    # 최종 판단: 개수 조건 만족 OR 성능 저하 조건 만족
    if is_count_trigger or is_performance_trigger:
        reason = "데이터 100개 도달" if is_count_trigger else "성능 지표 이상 포착"
        print(f"--- [MLOps] RPM {rpm} 재학습 트리거 실행 (사유: {reason}) ---")
        run_retraining() 

# --- 메인 API 엔드포인트 ---

@app.post("/predict")
async def predict_and_manage_data(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    rpm: str = Form(...),
    user_id: int = Form(1)
):
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext != 'csv':
        raise HTTPException(status_code=400, detail="CSV 파일만 업로드 가능합니다.")

    try:
        content = await file.read()
        file_sha256 = get_sha256(content)
        
        raw_df = pd.read_csv(BytesIO(content), header=None)
        df = raw_df.iloc[:, [0]]
        
        last_entry = await model_inputs_col.find_one(
            {"rpm": rpm},
            sort=[("created_at", -1)]
        )
        
        curr_mean = float(df.iloc[:, 0].mean())
        
        if last_entry and "mean_val" in last_entry:
            ref_mean = last_entry["mean_val"]
        else:
            ref_mean = curr_mean

        mean_diff = abs(curr_mean - ref_mean)
        is_validated = mean_diff < 5.0 

        # --- [추론 및 에러 처리 수정] ---
        try:
            results = predictor.predict(df, rpm)
            if results is None:
                return {"status": "error", "message": "해당 RPM의 모델을 찾을 수 없습니다."}
            
            # 리스트로 반환될 경우 첫 번째 요소에서 에러값 추출 (AttributeError 방지)
            if isinstance(results, list) and len(results) > 0:
                # 결과 리스트의 첫 번째 항목이 딕셔너리인지 확인 후 추출
                first_res = results[0]
                current_error = first_res.get("recon_error", 0) if isinstance(first_res, dict) else 0
            elif isinstance(results, dict):
                current_error = results.get("recon_error", 0)
            else:
                current_error = 0

        except Exception as inf_err:
            return {
                "status": "error", 
                "message": f"추론 오류 발생: {str(inf_err)}",
                "detail": "입력 데이터와 모델 차원 불일치 혹은 결과 파싱 오류"
            }

        save_path = ""
        if is_validated:
            target_dir = STORAGE_PATH / rpm
            os.makedirs(target_dir, exist_ok=True)
            
            filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
            save_path = str(target_dir / filename)
            df.to_csv(save_path, index=False, header=False)

            doc = {
                "user_id": user_id,
                "rpm": rpm,
                "original_filename": file.filename,
                "storage_path": save_path,
                "file_size_bytes": len(content),
                "sha256": file_sha256,
                "file_ext": file_ext,
                "mime_type": file.content_type,
                "row_count": len(df),
                "mean_val": curr_mean,
                "error_val": current_error, # 모니터링 분석을 위한 오차값 저장
                "created_at": datetime.utcnow()
            }
            await model_inputs_col.insert_one(doc)
            
            # 백그라운드 태스크로 재학습 트리거 로직 실행
            background_tasks.add_task(trigger_retraining_if_needed, rpm, current_error)
        else:
            print(f"--- [Skip] 유사성 검사 실패 (차이: {mean_diff:.2f}). 저장하지 않습니다. ---")

        return {
            "status": "success",
            "is_saved": is_validated,
            "rpm": rpm,
            "mean_diff": round(mean_diff, 4),
            "data": results
        }

    except Exception as e:
        return {"status": "error", "message": f"처리 중 오류: {str(e)}"}

# --- 모니터링 및 관리 API ---


import numpy as np
import json
from scipy.stats import ks_2samp
from fastapi import APIRouter

@app.get("/api/monitoring/latest-analysis")
async def get_latest_analysis():
    # 1. MongoDB (nutdb.model_inputs)에서 가장 최근 데이터 1건 조회
    latest_doc = await model_inputs_col.find().sort("created_at", -1).limit(1).to_list(length=1)
    
    if not latest_doc:
        return {"status": "error", "message": "No data found in MongoDB."}
    
    doc = latest_doc[0]
    rpm = str(doc["rpm"]) # "800", "1000", "1200" 등
    
    # 2. 모델 파일 경로 설정 (이미지 구조 기반)
    model_path = MODEL_DIR / f"model_{rpm}"
    baseline_path = model_path / "ae_errors.npy"
    threshold_path = model_path / "threshold.json"
    
    if not baseline_path.exists():
        return {"status": "error", "message": f"Baseline file for RPM {rpm} not found."}

    # 3. 데이터 로드 및 통계 계산
    baseline_errors = np.load(str(baseline_path))
    with open(threshold_path, 'r') as f:
        threshold_config = json.load(f)
        limit = threshold_config.get("threshold", 0.5)

    # 최근 100개 오차 데이터를 가져와 지표 계산 (재학습 판단 로직과 동일)
    cursor = model_inputs_col.find({"rpm": rpm}).sort("created_at", -1).limit(100)
    recent_docs = await cursor.to_list(length=100)
    recent_errors = np.array([d.get("error_val", 0) for d in recent_docs])

    variance = float(np.var(recent_errors))
    tcr = float(np.mean(recent_errors > limit))
    _, p_value = ks_2samp(baseline_errors, recent_errors)

    # 4. 시각화를 위한 히스토그램 데이터 생성 (간소화 버전)
    # 실제 구현 시에는 np.histogram을 사용하여 구간별 빈도를 계산합니다.
    chart_data = [
        {"range": "0.0-0.2", "baseline": 0.5, "current": 0.4},
        {"range": "0.2-0.4", "baseline": 0.3, "current": 0.35},
        {"range": "0.4-0.6", "baseline": 0.1, "current": 0.2}, # TCR 발생 구역
        {"range": "0.6-0.8", "baseline": 0.05, "current": 0.04},
        {"range": "0.8+", "baseline": 0.05, "current": 0.01},
    ]

    return {
        "rpm": rpm,
        "filename": doc["original_filename"],
        "timestamp": doc["created_at"].isoformat(),
        "metrics": {
            "variance": variance,
            "tcr": tcr,
            "p_value": p_value,
            "current_error": doc.get("error_val", 0),
            "limit": limit
        },
        "chartData": chart_data
    }

@app.delete("/monitoring/delete-anomaly")
async def delete_anomaly_data(sha256: str):
    doc = await model_inputs_col.find_one({"sha256": sha256})
    if doc:
        path = doc.get("storage_path")
        if os.path.exists(path):
            os.remove(path)
        await model_inputs_col.delete_one({"sha256": sha256})
        return {"status": "deleted", "sha256": sha256}
    return {"status": "error", "message": "기록을 찾을 수 없습니다."}

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)