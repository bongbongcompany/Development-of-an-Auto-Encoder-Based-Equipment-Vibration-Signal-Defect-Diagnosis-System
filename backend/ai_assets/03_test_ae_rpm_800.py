import json
import numpy as np
import pandas as pd
from pathlib import Path
from scipy.signal import decimate
from sklearn.neural_network import MLPRegressor

# ================== 경로 설정 (상대 경로) ==================
CUR_DIR = Path(__file__).resolve().parent

# 테스트용 CSV (경로가 없다면 적절히 수정 필요)
CSV_PATH  = CUR_DIR.parent / "Case1" / "Case1_800.csv" 

# 이미지상 RPM_model/model_800 폴더 구조 반영 
MODEL_NPZ = CUR_DIR / "RPM_model" / "model_800" / "ae_sklearn.npz"
THR_PATH  = CUR_DIR / "RPM_model" / "model_800" / "threshold.json"
DATA_NPZ  = CUR_DIR / "data_proc_rpm" / "800" / "dataset.npz" [cite: 13]

# ================== 1. 학습 데이터 정보 로드 ==================
if not DATA_NPZ.exists():
    raise FileNotFoundError(f"파일을 찾을 수 없습니다: {DATA_NPZ}")

data = np.load(str(DATA_NPZ), allow_pickle=True)

mean  = data["mean"]
std   = data["std"]
win   = int(data["win"])
hop   = int(data["hop"])
fs    = int(data["fs"])
decim = int(data["decim"])

print("WIN:", win, "HOP:", hop, "FS:", fs)

# ================== 2. 모델 로드 ==================
model_npz = np.load(MODEL_NPZ, allow_pickle=True)

coefs = model_npz["coefs"]
intercepts = model_npz["intercepts"]
hidden = tuple(model_npz["hidden"])

ae = MLPRegressor(hidden_layer_sizes=hidden)
ae.coefs_ = list(coefs)
ae.intercepts_ = list(intercepts)
ae.n_layers_ = len(ae.coefs_) + 1
ae.out_activation_ = "identity"

# ================== 3. threshold ==================
with open(THR_PATH, "r", encoding="utf-8") as f:
    threshold = json.load(f)["threshold"]

# ================== 4. CSV 로드 (1컬럼) ==================
df = pd.read_csv(CSV_PATH, header=None)
x = df.iloc[:, 0].astype(np.float32).values.reshape(-1, 1)

# ================== 5. Decimate ==================
if decim > 1:
    x = decimate(x[:, 0], decim, ftype="fir", zero_phase=True).reshape(-1, 1)

# mean 제거
x = x - x.mean(axis=0, keepdims=True)

# ================== 6. Windowing ==================
frames = []
for i in range(0, len(x) - win + 1, hop):
    frames.append(x[i:i + win])

frames = np.asarray(frames, dtype=np.float32)

if len(frames) == 0:
    raise RuntimeError("윈도우가 생성되지 않았습니다.")

# ================== 7. FFT → feature ==================
fft = np.fft.rfft(frames, axis=1)   # (B, F, 1)
mag = np.abs(fft)
feat = np.log1p(mag)

X = feat.reshape(feat.shape[0], -1)

print("Feature dim:", X.shape[1], "Expected:", mean.shape[1])

# ================== 8. 정규화 ==================
Xn = (X - mean) / std

# ================== 9. AutoEncoder ==================
X_recon = ae.predict(Xn)
recon_err = np.mean((Xn - X_recon) ** 2, axis=1)

# ================== 10. 판정 ==================
score = recon_err.mean()
result = int(score > threshold)

print("\n===== RESULT =====")
print("Reconstruction error:", score)
print("Threshold:", threshold)
print("Anomaly:", result)
