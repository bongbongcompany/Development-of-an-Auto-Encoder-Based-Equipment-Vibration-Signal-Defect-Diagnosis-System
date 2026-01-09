# backend/ai_assets/inference.py
import numpy as np
import json
import os
from pathlib import Path
from scipy.signal import decimate
from sklearn.neural_network import MLPRegressor
from scipy.stats import ks_2samp
class Monitor:
    def __init__(self, threshold=0.5):
        self.threshold = threshold
        self.baseline_errors = [] # 초기 학습 시의 오차 분포 저장 필요

    def check_retrain_conditions(self, y_true, y_pred):
        errors = np.abs(y_true - y_pred)
        
        # 1. 오차 분산 측정
        variance_increased = np.var(errors) > 1.5  # 예시 임계값

        # 2. Threshold Crossing Rate (TCR)
        # 오차가 설정한 임계값을 넘는 비율
        tcr = np.mean(errors > self.threshold)
        tcr_changed = tcr > 0.2  # 오차율 20% 초과 시

        # 3. Error Distribution Shape (KS Test)
        # 과거 오차 분포와 현재 오차 분포가 통계적으로 다른지 확인
        if len(self.baseline_errors) > 0:
            _, p_value = ks_2samp(self.baseline_errors, errors)
            shape_collapsed = p_value < 0.05  # 분포가 유의미하게 변함
        else:
            shape_collapsed = False

        # 세 조건 모두 충족 시 True 반환
        should_retrain = variance_increased and tcr_changed and shape_collapsed
        
        return {
            "should_retrain": should_retrain,
            "metrics": {
                "variance": float(np.var(errors)),
                "tcr": float(tcr),
                "p_value": float(p_value) if len(self.baseline_errors) > 0 else 1.0
            }
        }
    
class NutPredictor:
    def __init__(self, base_model_dir: str, base_data_dir: str):
        """
        :param base_model_dir: backend/ai_assets/RPM_model
        :param base_data_dir: backend/ai_assets/data_proc_rpm
        """
        self.base_model_dir = Path(base_model_dir)
        self.base_data_dir = Path(base_data_dir)
        self.models = {}   # 로드된 모델 캐싱
        self.configs = {}  # RPM별 전처리 설정 캐싱

    def load_model(self, rpm):
        """특정 RPM에 해당하는 모델과 설정 파일을 로드합니다."""
        rpm_str = str(rpm)
        model_folder = f"model_{rpm_str}"
        
        # pathlib을 사용하여 경로 결합
        model_path = self.base_model_dir / model_folder / "ae_sklearn.npz"
        thr_path = self.base_model_dir / model_folder / "threshold.json"
        data_path = self.base_data_dir / rpm_str / "dataset.npz"

        if not model_path.exists():
            print(f"Error: Model not found at {model_path}")
            return None, None

        # 1. 전처리 기준 및 Threshold 로드
        try:
            data_info = np.load(str(data_path), allow_pickle=True)
            with open(thr_path, "r", encoding="utf-8") as f:
                thr_data = json.load(f)
        except Exception as e:
            print(f"Error loading data info or threshold: {e}")
            return None, None

        config = {
            "mean": data_info["mean"],
            "std": data_info["std"],
            "win": int(data_info["win"]),
            "hop": int(data_info["hop"]),
            "decim": int(data_info["decim"]),
            "threshold": float(thr_data["threshold"])
        }

        # 2. 모델 가중치 복원
        try:
            model_npz = np.load(str(model_path), allow_pickle=True)
            hidden = tuple(model_npz["hidden"])
            
            ae = MLPRegressor(hidden_layer_sizes=hidden)
            
            # 가중치 직접 주입
            ae.coefs_ = list(model_npz["coefs"])
            ae.intercepts_ = list(model_npz["intercepts"])
            ae.n_layers_ = len(ae.coefs_) + 1
            ae.n_outputs_ = ae.coefs_[-1].shape[1]  # 출력 노드 수 설정
            ae.out_activation_ = "identity" 

            self.models[rpm_str] = ae
            self.configs[rpm_str] = config
            return ae, config
        except Exception as e:
            print(f"Error restoring model weights: {e}")
            return None, None
    
    def predict(self, df_signal, rpm):
        """입력 신호(DataFrame)에 대해 윈도우별 FFT 추론을 수행합니다."""
        rpm_str = str(rpm)
        
        if rpm_str not in self.models:
            res = self.load_model(rpm_str)
            if res[0] is None: return None

        cfg = self.configs[rpm_str]
        ae = self.models[rpm_str]

        # 1. 원시 신호 전처리
        # DataFrame에서 첫 번째 컬럼 추출
        x = df_signal.iloc[:, 0].astype(np.float32).values.reshape(-1, 1)
        
        # Decimate
        if cfg["decim"] > 1:
            # decimate는 1D 배열을 기대하므로 x[:, 0] 전달
            x_dec = decimate(x[:, 0], cfg["decim"], ftype="fir", zero_phase=True)
            x = x_dec.reshape(-1, 1)
        
        # Mean Removal
        x = x - np.mean(x)

        # 2. Windowing
        frames = []
        win, hop = cfg["win"], cfg["hop"]
        for i in range(0, len(x) - win + 1, hop):
            frames.append(x[i : i + win])
        
        frames = np.asarray(frames, dtype=np.float32)
        if len(frames) == 0: return None

        # 3. FFT -> Log1p Feature 추출 (B, Win, 1) -> (B, F)
        fft = np.fft.rfft(frames, axis=1)
        mag = np.abs(fft)
        feat = np.log1p(mag).reshape(len(frames), -1)

        # 4. Normalization
        # mean, std가 (F,) 형태여야 하므로 차원 확인
        Xn = (feat - cfg["mean"]) / (cfg["std"] + 1e-9) # 0 나누기 방지

        # 5. Inference & Reconstruction Error (MSE)
        try:
            X_recon = ae.predict(Xn)
            recon_err = np.mean((Xn - X_recon) ** 2, axis=1)
        except Exception as e:
            print(f"Inference Error: {e}")
            return None
        
        # 6. 결과 생성 (FastAPI/Frontend 형식 일치)
        results = []
        for i, err in enumerate(recon_err):
            # float() 변환으로 JSON 직렬화 보장
            err_val = float(err)
            results.append({
                "window_index": i,
                "error": err_val,
                "threshold": cfg["threshold"],
                "is_anomaly": bool(err_val > cfg["threshold"])
            })
        
        return results