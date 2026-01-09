import os, json, numpy as np
import pandas as pd
from sklearn.neural_network import MLPRegressor
from datetime import datetime
from pathlib import Path

# 설정 (기존 스크립트의 설정 통합)
ASSETS_DIR = Path("./ai_assets")
MODEL_OUT = ASSETS_DIR / "ae_sklearn.npz"
THR_OUT = ASSETS_DIR / "threshold.json"
STATS_OUT = ASSETS_DIR / "feature_stats.npz"

def run_retrain(data_list):
    """
    data_list: DB에서 가져온 csv 파일 경로들의 리스트
    """
    print(f"[{datetime.now()}] 자동 재학습 시작...")
    
    X_all = []
    
    # 1. 전처리 (기존 01_prepare_data 로직 요약)
    for file_path in data_list:
        if not os.path.exists(file_path): continue
        df = pd.read_csv(file_path, header=None)
        # ... (여기서 기존의 FFT 및 전처리 로직 수행하여 feature 추출)
        # 예시로 임의의 feature 생성 (실제로는 기존 extract_features_from_raw_2ch 사용)
        # X_all.append(features)
        pass

    # 실제 구현 시에는 전처리된 데이터를 X_train으로 구성
    # X_train = np.concatenate(X_all, axis=0)
    
    # 2. 모델 학습 (기존 02_train_ae_sklearn 로직)
    HIDDEN = (64, 16, 64)
    ae = MLPRegressor(hidden_layer_sizes=HIDDEN, activation="relu", max_iter=500)
    
    # ae.fit(X_train, X_train) 
    
    # 3. 결과 저장 (새로운 모델 및 임계값)
    # np.savez(MODEL_OUT, coefs=ae.coefs_, intercepts=ae.intercepts_)
    # threshold 계산 후 json 저장...
    
    # 3-1. 버전별 파일명 생성
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    MODEL_VERSION_OUT = f"ai_assets/ae_sklearn_{timestamp}.npz"
    THR_VERSION_OUT = f"ai_assets/threshold_{timestamp}.json"

    # 3-2. 학습 결과 저장 (버전 기록용)
    np.savez(MODEL_VERSION_OUT, ...) 
    # ... json 저장 ...

    # 3-3. 서비스용 "최신 모델" 파일 교체 (덮어쓰기 또는 심볼릭 링크)
    # app.py는 항상 'ae_sklearn.npz'를 읽으므로, 이 파일을 새 모델로 교체해줍니다.
    import shutil
    shutil.copy(MODEL_VERSION_OUT, "ai_assets/ae_sklearn.npz")
    shutil.copy(THR_VERSION_OUT, "ai_assets/threshold.json")

    print(f"새 모델 버전 생성 완료: {MODEL_VERSION_OUT}")
    print(f"서비스용 모델이 최신 버전으로 교체되었습니다.")
