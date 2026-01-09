import os, json
import numpy as np
from pathlib import Path
from sklearn.neural_network import MLPRegressor

# ===== 경로 설정 (현재 파일 위치 기준 상대 경로) =====
CUR_DIR = Path(__file__).resolve().parent
BASE_DATA_DIR = CUR_DIR / "data_proc_rpm"  # ai_assets/data_proc_rpm 
BASE_MODEL_DIR = CUR_DIR / "RPM_model"     # ai_assets/RPM_model 

RPM_LIST = ["800", "1000", "1200"]
TRAIN_CASES = [0]
HIDDEN = (64, 16, 64)
MAX_ITER = 500
RANDOM_STATE = 42

def train_one_rpm(rpm: str):
    print(f"\n===== Training RPM {rpm} =====")

    # 데이터 로드 경로: data_proc_rpm/{rpm}/dataset.npz 
    NPZ = BASE_DATA_DIR / rpm / "dataset.npz"

    # 모델 저장 경로: RPM_model/model_{rpm}/... 
    OUT_DIR = BASE_MODEL_DIR / f"model_{rpm}"
    MODEL_OUT = OUT_DIR / "ae_sklearn.npz"
    THR_OUT = OUT_DIR / "threshold.json"
    ERR_OUT = OUT_DIR / "ae_errors.npy"

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # 데이터 로드
    data = np.load(str(NPZ), allow_pickle=True)
    X = data["X"].astype(np.float32)

    # ===== 데이터 로드 =====
    data = np.load(NPZ, allow_pickle=True)
    X = data["X"].astype(np.float32)
    case_id = data["case_id"].astype(np.int32)

    mask = np.isin(case_id, np.array(TRAIN_CASES, dtype=np.int32))
    X_train = X[mask]

    if len(X_train) < 5:
        raise SystemExit(f"[RPM {rpm}] 정상 학습 데이터가 너무 적습니다.")

    # ===== AE 학습 =====
    ae = MLPRegressor(
        hidden_layer_sizes=HIDDEN,
        activation="relu",
        solver="adam",
        max_iter=MAX_ITER,
        random_state=RANDOM_STATE,
        verbose=True
    )

    ae.fit(X_train, X_train)

    # ===== Threshold 계산 =====
    recon_train = ae.predict(X_train)
    err_train = np.mean((recon_train - X_train) ** 2, axis=1)
    threshold = float(np.percentile(err_train, 95))

    # ===== 전체 error 저장 =====
    recon_all = ae.predict(X)
    err_all = np.mean((recon_all - X) ** 2, axis=1)
    np.save(ERR_OUT, err_all)

    # ===== 모델 저장 =====
    np.savez(
        MODEL_OUT,
        coefs=np.array(ae.coefs_, dtype=object),
        intercepts=np.array(ae.intercepts_, dtype=object),
        hidden=np.array(HIDDEN, dtype=np.int32),
        allow_pickle=True
    )

    with open(THR_OUT, "w", encoding="utf-8") as f:
        json.dump({
            "rpm": rpm,
            "train_cases": TRAIN_CASES,
            "threshold_method": "p95(train_recon_error)",
            "threshold": threshold,
            "train_err_mean": float(err_train.mean()),
            "train_err_p95": float(np.percentile(err_train, 95)),
            "train_err_p99": float(np.percentile(err_train, 99))
        }, f, ensure_ascii=False, indent=2)

    print(f"[RPM {rpm}] DONE | threshold = {threshold:.6e}")


def main():
    for rpm in RPM_LIST:
        train_one_rpm(rpm)


if __name__ == "__main__":
    main()
