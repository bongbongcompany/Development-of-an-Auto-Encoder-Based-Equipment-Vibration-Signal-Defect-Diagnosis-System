🔩 Nut Loosening Analysis Module
이 모듈은 회전 기기에서 발생하는 진동 데이터를 AutoEncoder(딥러닝) 모델로 분석하여, 너트 풀림이나 기타 기계적 이상 징후를 실시간으로 탐지하는 통합 솔루션입니다.

🎨 UI 모델 선택 가이드
사용자는 채팅창 상단의 Model Selector를 통해 다음과 같이 모델을 관리할 수 있습니다.

1. 모델 전환 방법
채팅 인터페이스 우측 상단의 [모델 선택] 드롭다운 메뉴를 클릭합니다.

사용하고자 하는 모델(800, 1000, 1200) 중 하나를 선택합니다.

선택 즉시 백엔드 API 서버에 모델 전환 요청이 전달되며, 이후의 답변은 선택된 모델이 생성합니다.
🌟 핵심 기능 (Core Features)
1. AI 기반 이상 탐지 (Anomaly Detection)
AutoEncoder 추론: 정상 상태의 특징을 학습한 모델이 입력 데이터를 재구성하고, 이때 발생하는 Reconstruction Error가 임계치(Threshold)를 넘으면 이상으로 판별합니다.

FFT 분석 기반: 진동 원신호를 주파수 영역으로 변환(FFT)하여 모델의 입력 데이터로 사용합니다.

2. 데이터 품질 관리 (Similarity Validation)
지능형 데이터 필터링: 새로운 데이터 업로드 시, 기존 DB에 저장된 데이터의 평균값과 비교하여 오차가 임계값(5.0) 이내인 경우에만 유효 데이터로 인정하고 저장합니다.

중복 방지: SHA-256 해시 알고리즘을 사용하여 동일한 파일의 중복 업로드를 차단합니다.

3. MLOps 자동화 (Retraining Pipeline)
자동 재학습 트리거: 특정 RPM의 유효 데이터가 100개 단위로 수집될 때마다 백그라운드에서 모델 재학습 프로세스를 자동으로 실행하여 모델의 정확도를 유지합니다.

🛠 기술 스택 (Technical Stack)
Backend (AI API)

Database: MongoDB (Motor Driver)

Frontend (Analytics Dashboard)
Library: React (TypeScript), Vite

Visualization: Recharts (Trend Line Chart)

Icons: Lucide-react

DevOps & MLOps
Docker & Docker Compose: 전체 인프라(AI, Node, MongoDB, Frontend)의 컨테이너화 및 오케스트레이션

MLOps Pipeline:

데이터 100개 수집 시 마다 run_retraining() 자동 호출 (Trigger-based Retraining)

데이터 무결성을 위한 유사성 검증(Similarity Check) 로직 포함

Storage: MongoDB를 활용한 AI 입력 데이터 및 모델 메타데이터 이력 관리

Backend (AI API)
Framework: FastAPI (Asynchronous API)

Library: Pandas(데이터 전처리), NumPy, Scikit-learn(AutoEncoder 추론), Motor(비동기 DB)


🏗️ 시스템 아키텍처 (Architecture)
Docker Compose: 4개의 독립된 컨테이너(ai-api, node-api, mongodb, frontend)가 가상 네트워크로 연결되어 유기적으로 동작합니다.

Data Flow:

사용자가 CSV 업로드 → frontend

frontend에서 ai-api(서버)로 데이터 전달

ai-api에서 첫 번째 열 강제 추출 및 유사성 검사

유사성 통과 시 mongodb 저장 및 추론 결과 반환

데이터 임계치(100개) 도달 시 재학습 트리거 발생

📊 대시보드 사용 가이드 (User Guide)
RPM 선택: 분석 대상 기기의 가동 속도(800, 1000, 1200 RPM 등)를 선택합니다.

데이터 업로드: 진동 센서로부터 수집된 .csv 파일을 선택합니다.

분석 실행: '분석 실행' 버튼을 클릭하면 서버에서 AutoEncoder 추론이 진행됩니다.

결과 해석:

Summary Cards: 최대 오차값 및 분석 상태(NORMAL/ANOMALY)를 즉시 확인합니다.

Trend Chart: 시간 흐름(Window Index)에 따른 오차 변화를 모니터링합니다. 빨간 점은 임계치를 넘긴 이상 지점입니다.

Detailed Table: 각 윈도우별 상세 오차 수치와 분포도를 확인합니다.

데이터 형식: CSV 파일은 헤더가 없는 단일 열(Single Column) 형태여야 합니다.

유사성 검사: 현재 데이터의 평균값이 기존 데이터와 너무 다를 경우, DB에 저장되지 않고 추론 결과만 출력됩니다. (데이터 무결성 유지 목적) 

단일 열 상태가 아닐때 강제로 1컬럼 전처리 , 유사성이 맞지 않을때 추론만 하고 저장하지 않음