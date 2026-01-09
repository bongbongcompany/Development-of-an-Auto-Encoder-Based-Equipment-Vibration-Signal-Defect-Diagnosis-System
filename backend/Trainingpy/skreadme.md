# Vibration Anomaly Detection – Training Pipeline

본 디렉토리는 **산업 설비 진동 데이터 기반 이상탐지 AI 모델 학습을 위한 오프라인 파이프라인**을 포함합니다.  
실시간 서비스(웹/앱)에는 본 스크립트들이 직접 사용되지 않으며,  
본 파이프라인을 통해 **학습된 모델 산출물(.npz, .json)** 만 전달됩니다.

---

## 1. 프로젝트 개요

- 목적: 진동 센서 시계열 데이터를 이용한 **비지도학습 기반 이상탐지 모델 개발**
- 모델: AutoEncoder 기반 Reconstruction Error 방식
- 학습 방식: 정상 데이터만을 이용한 Unsupervised Learning
- 적용 대상: B2B 산업 설비 이상 감지 (모터, 볼트 체결 구조 등)

---

## 2. 파일 구성 및 역할

### 01_prepare_data.py
**데이터 전처리 및 학습용 데이터셋 생성**

- 원시 CSV 파일 로드
- 센서 신호 정규화(mean/std)
- 고정 길이 윈도우 기반 시계열 분할
- 학습용 feature 벡터 생성
- 출력:
  - `data_proc/dataset.npz`
    - `X`: 학습 입력 데이터 (windows × feature_dim)
    - `case_ids`: 케이스 식별자
    - `mean`, `std`: 정규화 파라미터

---

### 02_train_ae_sklearn.py
**AutoEncoder 모델 학습**

- Scikit-learn 기반 AutoEncoder(MLPRegressor) 사용
- 정상 데이터 기반 Reconstruction Error 최소화 학습
- 학습 종료 조건:
  - loss 수렴
  - early stopping
- 출력:
  - `models/ae_sklearn.npz` (모델 가중치)
  - `models/threshold.json` (이상 판정 임계값)

---

### 03_inference_eval.py
**학습된 모델 기반 이상탐지 평가**

- 전체 케이스에 대한 reconstruction error 계산
- 케이스별 통계량 산출:
  - mean error
  - 95/99 percentile
- threshold 초과 여부 기반 anomaly 판정
- 출력:
  - 케이스별 이상 여부 테이블 (CSV 또는 콘솔 출력)

---

### 04_plot.py
**AI 학습 및 결과 시각화**

- 원시 진동 신호 시각화
- 윈도우 단위 신호 예시
- Reconstruction Error 분포 시각화
- 정상/이상 케이스 비교 그래프
- 목적:
  - 모델 동작 검증
  - 발표 및 보고서용 시각 자료 생성

---

## 3. 실행 환경

- OS: Windows
- Python: 3.11
- 가상환경: `Vibe`
- 주요 라이브러리:
  - numpy
  - pandas
  - scikit-learn
  - matplotlib

---

## 4. 실행 순서

```bash
python 01_prepare_data.py
python 02_train_ae_sklearn.py
python 03_inference_eval.py
python 04_plot.py
