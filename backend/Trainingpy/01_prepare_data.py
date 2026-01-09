# 01_prepare_data.py
import os, glob, re, json
import numpy as np
import pandas as pd
from scipy.signal import decimate
from tqdm import tqdm

RAW_DIR = r"D:\Vibe\data_raw"
OUT_PATH = r"D:\Vibe\data_proc\dataset.npz"
META_PATH = r"D:\Vibe\data_proc\meta.json"

# ====== 저사양 CPU 기준 추천 ======
ORIG_FS = 10_000_000
TARGET_FS = 20_000
WIN_SEC = 0.02   # ✅ 너가 방금 성공한 값(권장)
HOP_SEC = 0.01
USE_DECIMATE = True

# 윈도우가 너무 많아지는 걸 막기 위한 상한(필요 없으면 None)
MAX_WINDOWS_PER_CSV = None  # 예: 2000

def pick_two_numeric_cols(df: pd.DataFrame) -> np.ndarray:
    num = df.apply(pd.to_numeric, errors="coerce")
    valid_counts = num.notna().sum().sort_values(ascending=False)
    cols = list(valid_counts.index[:2])
    x = num[cols].dropna().to_numpy(dtype=np.float32)
    if x.shape[1] != 2:
        raise ValueError("2개 채널(숫자 컬럼)을 찾지 못했습니다.")
    return x

def frame_signal(x: np.ndarray, win: int, hop: int) -> np.ndarray:
    if x.shape[0] < win:
        return np.empty((0, win, 2), dtype=np.float32)
    idx = np.arange(0, x.shape[0] - win + 1, hop)
    if idx.size == 0:
        return np.empty((0, win, 2), dtype=np.float32)
    frames = np.stack([x[i:i+win] for i in idx], axis=0).astype(np.float32)
    return frames

def log_fft_features(frames: np.ndarray) -> np.ndarray:
    fft = np.fft.rfft(frames, axis=1)
    mag = np.abs(fft).astype(np.float32)     # (B, F, 2)
    feat = np.log1p(mag).astype(np.float32)  # 안정적 로그
    return feat.reshape(feat.shape[0], -1)

def extract_case_id(path: str) -> int:
    m = re.search(r"(?:\\|/)(Case)(\d+)(?:\\|/)", path)
    if not m:
        # fallback: filename에도 CaseN이 있을 수 있음
        m = re.search(r"Case(\d+)", os.path.basename(path))
    if not m:
        raise ValueError(f"Case 번호를 추출할 수 없습니다: {path}")
    return int(m.group(2) if m.lastindex >= 2 else m.group(1)) - 1

def main():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

    csv_files = sorted(glob.glob(os.path.join(RAW_DIR, "Case*", "*.csv")))
    if not csv_files:
        raise SystemExit(f"CSV가 없습니다: {RAW_DIR}\\Case*\\*.csv")

    decim = max(1, int(round(ORIG_FS / TARGET_FS)))
    fs = int(round(ORIG_FS / decim)) if USE_DECIMATE else ORIG_FS
    win = int(round(WIN_SEC * fs))
    hop = int(round(HOP_SEC * fs))

    X_list, case_list, path_list = [], [], []
    skipped = []

    for path in tqdm(csv_files, desc="Processing CSV"):
        try:
            df = pd.read_csv(path)
            x = pick_two_numeric_cols(df)  # (N,2)

            if USE_DECIMATE and decim > 1:
                x0 = decimate(x[:, 0], decim, ftype="fir", zero_phase=True).astype(np.float32)
                x1 = decimate(x[:, 1], decim, ftype="fir", zero_phase=True).astype(np.float32)
                x = np.stack([x0, x1], axis=1)

            x = x - x.mean(axis=0, keepdims=True)

            frames = frame_signal(x, win, hop)
            if frames.shape[0] == 0:
                skipped.append({"path": path, "reason": "too_short_after_decimate"})
                continue

            if MAX_WINDOWS_PER_CSV is not None and frames.shape[0] > MAX_WINDOWS_PER_CSV:
                frames = frames[:MAX_WINDOWS_PER_CSV]

            feats = log_fft_features(frames)  # (B,D)

            cid = extract_case_id(path)
            X_list.append(feats)
            case_list.append(np.full((feats.shape[0],), cid, dtype=np.int32))
            path_list.append(np.array([path] * feats.shape[0], dtype=object))

        except Exception as e:
            skipped.append({"path": path, "reason": str(e)})

    if not X_list:
        raise SystemExit("유효한 윈도우가 0개입니다. WIN_SEC/TARGET_FS를 조정하세요.")

    X = np.concatenate(X_list, axis=0).astype(np.float32)
    case_id = np.concatenate(case_list, axis=0)
    csv_path = np.concatenate(path_list, axis=0)

    mean = X.mean(axis=0, keepdims=True).astype(np.float32)
    std = (X.std(axis=0, keepdims=True) + 1e-8).astype(np.float32)
    Xn = ((X - mean) / std).astype(np.float32)

    np.savez_compressed(
        OUT_PATH,
        X=Xn, mean=mean, std=std,
        case_id=case_id,
        csv_path=csv_path,
        fs=np.int32(fs), win=np.int32(win), hop=np.int32(hop),
        decim=np.int32(decim),
    )

    meta = {
        "raw_dir": RAW_DIR,
        "num_csv_files_found": len(csv_files),
        "num_windows_total": int(Xn.shape[0]),
        "feature_dim": int(Xn.shape[1]),
        "fs_after": int(fs),
        "win_samples": int(win),
        "hop_samples": int(hop),
        "decim": int(decim),
        "skipped": skipped,
    }
    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    print("Saved:", OUT_PATH)
    print("Meta :", META_PATH)
    print("Total windows:", Xn.shape[0])
    print("Cases:", np.unique(case_id))

if __name__ == "__main__":
    main()
