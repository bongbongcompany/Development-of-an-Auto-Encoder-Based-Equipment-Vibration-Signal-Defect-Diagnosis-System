# backend/ai_assets/mlops.py
import subprocess
import os

def run_retraining():
    """기존에 작성하신 02_train_ae_sklearn_rpm.py 스크립트를 실행하여 모델을 갱신합니다."""
    script_path = "02_train_ae_sklearn_rpm.py" # 파일 경로 확인 필요
    if os.path.exists(script_path):
        print(f" [MLOps] 자동 재학습 시작...")
        # 백그라운드에서 학습 스크립트 실행
        subprocess.Popen(["python", script_path])
        return True
    return False