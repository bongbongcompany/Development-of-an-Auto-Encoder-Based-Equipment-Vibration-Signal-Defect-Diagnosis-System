# 02_train_ae_sklearn.py
import os, json
import numpy as np
from sklearn.neural_network import MLPRegressor

NPZ = r"D:\Vibe\data_proc\dataset.npz"
MODEL_OUT = r"D:\Vibe\models\ae_sklearn.npz"
THR_OUT = r"D:\Vibe\models\threshold.json"

# ===== 설정 =====
TRAIN_CASES = [0]      # Case1을 정상으로 가정
HIDDEN = (64, 16, 64)  # 가벼운 AE
MAX_ITER = 500
RANDOM_STATE = 42

def main():
    os.makedirs(os.path.dirname(MODEL_OUT), exist_ok=True)

    data = np.load(NPZ, allow_pickle=True)
    X = data["X"].astype(np.float32)
    case_id = data["case_id"].astype(np.int32)

    mask = np.isin(case_id, np.array(TRAIN_CASES, dtype=np.int32))
    X_train = X[mask]
    if len(X_train) < 5:
        raise SystemExit("정상 학습 데이터가 너무 적습니다.")

    ae = MLPRegressor(
        hidden_layer_sizes=HIDDEN,
        activation="relu",
        solver="adam",
        max_iter=MAX_ITER,
        random_state=RANDOM_STATE,
        verbose=True
    )

    print("Training sklearn AutoEncoder...")
    ae.fit(X_train, X_train)

    # 정상 데이터 기준 재구성 오차
    recon = ae.predict(X_train)
    err = np.mean((recon - X_train) ** 2, axis=1)

    threshold = float(np.percentile(err, 99))

    np.savez(
        MODEL_OUT,
        coefs=np.array(ae.coefs_, dtype=object),
        intercepts=np.array(ae.intercepts_, dtype=object),
        hidden=np.array(HIDDEN, dtype=np.int32),
        allow_pickle=True
    )
    with open(THR_OUT, "w", encoding="utf-8") as f:
        json.dump({
            "train_cases": TRAIN_CASES,
            "threshold_method": "p99(train_recon_error)",
            "threshold": threshold,
            "train_err_mean": float(err.mean()),
            "train_err_p95": float(np.percentile(err, 95)),
            "train_err_p99": threshold
        }, f, ensure_ascii=False, indent=2)

    print("Saved model:", MODEL_OUT)
    print("Saved threshold:", THR_OUT)
    print("Threshold:", threshold)

if __name__ == "__main__":
    main()
