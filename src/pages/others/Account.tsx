import React, { useContext, useState } from 'react';
import {
  Box,
  Container,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { SettingsContext, SettingsProvider } from 'pages/users/UserList';
import AccountsProvider from 'providers/AccountsProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';

interface MultiText {
  [key: string]: string;
}

interface Section {
  title: MultiText;
  content: MultiText;
  subContent?: MultiText;
  image?: string;
  imageDark?: string; // 다크모드용 이미지 경로 추가
}

const sections: Section[] = [
  {
    title: {
      ko: '개요',
      en: 'Overview',
      ja: '概要',
      zh: '概况',
      fr: 'Aperçu',
      sw: 'Muhtasari',
    },
    content: {
      ko: `AI모듈은 정상 상태의 진동 데이터만을 학습하여 이상 상태를 감지하는 AutoEncoder 기반 이상탐지 엔진입니다. 실제 센서 연동 이전 단계에서 기존 진동 데이터셋을 기반으로 모델의 유효성을 검증하였으며 웹, 앱, 실시간 시스템에 입력 인터페이스만 연결하면 즉시 적용 가능하도록 설계되었습니다. 본 모듈은 상태를 가지지 않는(stateless) 구조로, 서버 확장 및 서비스 통합에 용이합니다.`,
      en: `The AI module is an AutoEncoder-based anomaly detection engine that learns only normal-state vibration data to detect abnormal conditions. Prior to real sensor integration, the model validity was verified using existing vibration datasets. It is designed to be immediately applicable by simply connecting an input interface to web, app, or real-time systems. This module adopts a stateless architecture, making it easy to scale servers and integrate services.`,
      ja: `AIモジュールは正常状態の振動データのみを学習し、異常状態を検知するAutoEncoderベースの異常検知エンジンです。実際のセンサー連動前段階として既存の振動データセットを用いてモデルの有効性を検証しました。Web、アプリ、リアルタイムシステムに入力インターフェースを接続するだけで即時適用可能な設計です。本モジュールはステートレス構造を採用しており、サーバー拡張やサービス統合が容易です。`,
      zh: `该AI模块是基于AutoEncoder的异常检测引擎，仅使用正常状态的振动数据进行训练以检测异常。在实际传感器接入之前，已基于现有振动数据集验证了模型的有效性。只需将输入接口连接到Web、App或实时系统即可立即应用。本模块采用无状态（stateless）架构，便于服务器扩展和服务集成。`,
      fr: `Le module IA est un moteur de détection d’anomalies basé sur un auto-encodeur, entraîné uniquement à partir de données de vibration en état normal. Avant l’intégration de capteurs réels, la validité du modèle a été vérifiée à l’aide de jeux de données existants. Il est conçu pour être immédiatement applicable en connectant simplement une interface d’entrée aux systèmes web, mobiles ou temps réel. Le module adopte une architecture sans état (stateless), facilitant la montée en charge des serveurs et l’intégration des services.`,
      sw: `Moduli ya AI ni injini ya utambuzi wa hitilafu inayotegemea AutoEncoder, inayojifunza data za mtetemo katika hali ya kawaida pekee ili kugundua hali zisizo za kawaida. Kabla ya kuunganisha vihisi halisi, uhalali wa modeli ulithibitishwa kwa kutumia seti zilizopo za data za mtetemo. Imeundwa kutumika mara moja kwa kuunganisha tu kiolesura cha ingizo kwenye mifumo ya wavuti, programu au ya muda halisi. Moduli hii ina muundo usio na hali (stateless), unaorahisisha upanuzi wa seva na ujumuishaji wa huduma.`,
    },
  },
  {
    title: {
      ko: '모델 개요',
      en: 'Model Overview',
      ja: 'モデル概要',
      zh: '模型概述',
      fr: 'Présentation du modèle',
      sw: 'Muhtasari wa Modeli',
    },
    content: {
      ko: `Model type: AutoEncoder(sklearn MLP 기반)\nTraining strategy: 정상 상태 데이터만 학습 (Unsupervised/One-class learning)\nDecision rule: 입력 feature와 재구성 결과 간의 Mean Squared Error(MSE) 기반 Anomaly score 산출\nThreshold: 정상 데이터 기반 reconstruction error 분포의 p99 값을 사용합니다.`,
      en: `Model type: AutoEncoder (sklearn MLP-based)\nTraining strategy: Learning only normal-state data (Unsupervised / One-class learning)\nDecision rule: Anomaly score calculated based on Mean Squared Error (MSE) between input features and reconstruction\nThreshold: Uses the p99 value of the reconstruction error distribution from normal data.`,
      ja: `Model type: AutoEncoder（sklearn MLPベース）\nTraining strategy: 正常状態データのみ学習（教師なし／One-class learning）\nDecision rule: 入力特徴量と再構成結果間のMean Squared Error（MSE）に基づく異常スコア算出\nThreshold: 正常データの再構成誤差分布におけるp99値を使用`,
      zh: `模型类型：AutoEncoder（基于sklearn MLP）\n训练策略：仅使用正常状态数据训练（无监督 / 单类学习）\n判定规则：基于输入特征与重构结果之间的均方误差（MSE）计算异常分数\n阈值：使用正常数据重构误差分布的p99值`,
      fr: `Type de modèle : Auto-encodeur (basé sur sklearn MLP)\nStratégie d'entraînement : apprentissage uniquement à partir de données normales (non supervisé / one-class)\nRègle de décision : score d'anomalie basé sur l’erreur quadratique moyenne (MSE) entre les caractéristiques d’entrée et la reconstruction\nSeuil : utilisation de la valeur p99 de la distribution des erreurs de reconstruction des données normales.`,
      sw: `Aina ya modeli: AutoEncoder (imejengwa kwa sklearn MLP)\nMkakati wa mafunzo: Kujifunza data za hali ya kawaida pekee (Unsupervised / One-class learning)\nKanuni ya uamuzi: Alama ya hitilafu huhesabiwa kwa kutumia Mean Squared Error (MSE) kati ya vipengele vya ingizo na ujenzi upya\nKizingiti: Hutumia thamani ya p99 ya usambazaji wa kosa la ujenzi upya wa data za kawaida.`,
    },
  },
  {
    title: {
      ko: '입력 데이터 규격',
      en: 'Input Data Specification',
      ja: '入力データ仕様',
      zh: '输入数据规范',
      fr: 'Spécification des données d’entrée',
      sw: 'Vipimo vya Data ya Ingizo',
    },
    content: {
      ko: `AI모델은 아래 전처리가 반드시 적용된 입력을 가정합니다.\n1. 원시 진동 신호 수집 및 고정길이 윈도우 분할\n2. FFT 수행, Magnitude 계산, log(1 + magnitude) 적용\n3. feature_stats.npz의 mean, std로 정규화\n위 전처리 중 하나라도 누락되면 결과의 신뢰도가 보장되지 않습니다.`,
      en: `The AI model assumes inputs with the following preprocessing steps applied.\n1. Raw vibration signal collection and fixed-length window segmentation\n2. FFT execution, magnitude calculation, and log(1 + magnitude) application\n3. Normalization using mean and std from feature_stats.npz\nIf any of these preprocessing steps are omitted, result reliability cannot be guaranteed.`,
      ja: `AIモデルは以下の前처리가 반드시 적용된 입력을 전제로 하고 있습니다.\n1. 生の振動信号収集および固定長ウィンドウ分割\n2. FFT実行、Magnitude算出、log(1 + magnitude)適用\n3. feature_stats.npzのmean、stdによる正規化\nこれらの前処理のいずれかが欠落すると、結果の信頼性は保証されません.`,
      zh: `AI模型假定输入数据已应用以下预处理步骤。\n1. 采集原始振动信号并进行固定长度窗口划分\n2. 执行FFT，计算幅值，并应用log(1 + magnitude)\n3. 使用feature_stats.npz中的mean和std进行归一化\n若缺少任何一步预处理，结果的可靠性将无法保证。`,
      fr: `Le modèle IA suppose que les entrées ont subi les prétraitements suivants.\n1. Collecte des signaux de vibration bruts et segmentation en fenêtres de longueur fixe\n2. Exécution de la FFT, calcul de la magnitude et application de log(1 + magnitude)\n3. Normalisation à l’aide des valeurs mean et std de feature_stats.npz\nL’omission de l’une de ces étapes compromet la fiabilité des résultats.`,
      sw: `Modeli ya AI inadhania kuwa data za ingizo zimepitia hatua zifuatazo za uchakataji wa awali.\n1. Ukusanyaji wa ishara ghafi za mtetemo na ugawaji wa madirisha ya urefu maalum\n2. Utekelezaji wa FFT, hesabu ya magnitude, na matumizi ya log(1 + magnitude)\n3. Usawazishaji kwa kutumia mean na std kutoka feature_stats.npz\nIwapo hatua yoyote itakosekana, uaminifu wa matokeo hauwezi kuhakikishwa.`,
    },
  },
  {
    title: {
      ko: '출력 데이터 규격',
      en: 'Output Data Specification',
      ja: '出力データ仕様',
      zh: '输出数据规范',
      fr: 'Spécification des données de sortie',
      sw: 'Vipimo vya Data ya Tokeo',
    },
    content: {
      ko: `inference.py의 infer() 함수 반환값 예시:\n{ "error": 0.01234, "is_anomaly": true }\n- error: 재구성 오차 (Anomaly Score)\n- is_anomaly: 임계값(Threshold) 초과 여부`,
      en: `Example return value of infer() function in inference.py:\n{ "error": 0.01234, "is_anomaly": true }\n- error: Reconstruction error (Anomaly Score)\n- is_anomaly: Whether the threshold is exceeded`,
      ja: `inference.pyのinfer()関수의 戻り値例:\n{ "error": 0.01234, "is_anomaly": true }\n- error: 再構成誤差（異常スコア）\n- is_anomaly: 閾値（Threshold）超過 여부`,
      zh: `inference.py 中 infer() 函数的返回示例:\n{ "error": 0.01234, "is_anomaly": true }\n- error: 重构误差（异常分数）\n- is_anomaly: 是否超过阈值（Threshold）`,
      fr: `Exemple de valeur retournée par la fonction infer() dans inference.py :\n{ "error": 0.01234, "is_anomaly": true }\n- error : erreur de reconstruction (score d’anomalie)\n- is_anomaly : dépassement du seuil (Threshold)`,
      sw: `Mfano wa thamani ya kurejeshwa na kazi infer() katika inference.py:\n{ "error": 0.01234, "is_anomaly": true }\n- error: kosa la ujenzi upya (Alama ya Hitilafu)\n- is_anomaly: ikiwa kizingiti (Threshold) kimevukwa`,
    },
  },
  {
    title: {
      ko: '추론 사용 방법',
      en: 'Inference Usage',
      ja: '推論の使用方法',
      zh: '推理使用方法',
      fr: 'Utilisation de l’inférence',
      sw: 'Matumizi ya Utabiri',
    },
    content: {
      ko: `[기본 사용 예시]\nfrom inference import AnomalyDetector\ndetector = AnomalyDetector()\nresult = detector.infer(feature_vector)\nprint(result["error"], result["is_anomaly"])\n\n[권장 운영 로직]\n단일 윈도우 결과로 즉시 알림을 주기보다 연속 N회 이상 발생 시 이상으로 판단하는 것을 권장합니다. (예: 5개 중 3회 이상 혹은 2초 이상 지속 시 Alert)`,
      en: `[Basic usage example]\nfrom inference import AnomalyDetector\ndetector = AnomalyDetector()\nresult = detector.infer(feature_vector)\nprint(result["error"], result["is_anomaly"])\n\n[Recommended operational logic]\nRather than triggering alerts on a single window result, it is recommended to 판단 anomalies when they occur consecutively N times. (e.g., 3 out of 5 windows or持续超过 2 seconds)`,
      ja: `[基本的な使用例]\nfrom inference import AnomalyDetector\ndetector = AnomalyDetector()\nresult = detector.infer(feature_vector)\nprint(result["error"], result["is_anomaly"])\n\n[推奨運用ロジック]\n単一ウィンドウ結果で即時アラートを出すのではなく、連続N回以上発生した場合に異常と判断することを推奨します。（例：5回中3回以上、または2秒以上継続）`,
      zh: `[基本使用示例]\nfrom inference import AnomalyDetector\ndetector = AnomalyDetector()\nresult = detector.infer(feature_vector)\nprint(result["error"], result["is_anomaly"])\n\n[推荐运行逻辑]\n不建议仅凭单个窗口结果触发告警，而应在连续N次发生异常时判定。（例如：5次中3次以上，或持续2秒以上）`,
      fr: `[Exemple d’utilisation de base]\nfrom inference import AnomalyDetector\ndetector = AnomalyDetector()\nresult = detector.infer(feature_vector)\nprint(result["error"], result["is_anomaly"])\n\n[Logique d’exploitation recommandée]\nIl est recommandé de ne pas déclencher d’alerte sur une seule fenêtre, mais de considérer une anomalie lorsqu’elle se produit N fois consécutives (ex. : 3 sur 5 fenêtres ou persistance de plus de 2 secondes).`,
      sw: `[Mfano wa matumizi ya msingi]\nfrom inference import AnomalyDetector\ndetector = AnomalyDetector()\nresult = detector.infer(feature_vector)\nprint(result["error"], result["is_anomaly"])\n\n[Mantiki ya uendeshaji inayopendekezwa]\nBadala ya kutoa tahadhari kwa dirisha moja, inapendekezwa kutambua hitilafu endapo itatokea mara N mfululizo (mf. mara 3 kati의 5 au ikidumu zaidi ya sekunde 2).`,
    },
  },
  {
    title: {
      ko: '임계값 설정',
      en: 'Threshold Configuration',
      ja: '閾値設定',
      zh: '阈值设置',
      fr: 'Configuration du seuil',
      sw: 'Mipangilio ya Kizingiti',
    },
    content: {
      ko: `threshold.json에 저장된 값은 정상 데이터의 통계적 기준(p99)입니다. UI에서는 이 값을 경고 기준선으로 시각화하여 사용합니다.`,
      en: `The value stored in threshold.json is the statistical reference (p99) of normal data. In the UI, this value is visualized as the warning baseline.`,
      ja: `threshold.jsonに保存されている値は正常データの統計的基準（p99）です。UIでは警告基準線として可視化されます。`,
      zh: `threshold.json 中存储的值是正常数据的统计基准（p99）。在UI中，该值将作为告警基准线进行可视化。`,
      fr: `La valeur stockée dans threshold.json correspond au seuil statistique (p99) des données normales. Dans l’interface utilisateur, cette valeur est visualisée comme ligne de référence d’alerte.`,
      sw: `Thamani iliyohifadhiwa kwenye threshold.json ni rejea ya takwimu (p99) ya data za kawaida. Katika UI, thamani hii huonyeshwa kama mstari wa tahadhari.`,
    },
  },
  {
    title: {
      ko: '시스템 연계',
      en: 'System Integration',
      ja: 'システム連携',
      zh: '系统集成',
      fr: 'Intégration système',
      sw: 'Ujumuishaji wa Mfumo',
    },
    content: {
      ko: '서버와 AI 모듈 간의 독립 구조',
      en: 'Independent architecture between the server and the AI module',
      ja: 'サーバーとAIモジュール間の独立構造',
      zh: '服务器与AI模块之间的独立架构',
      fr: 'Architecture indépendante entre le serveur et le module IA',
      sw: 'Muundo huru kati ya seva na moduli ya AI',
    },
    image: '/assets/images/design.png',
    imageDark: '/assets/images/design_dark.png', // 다크모드용 이미지 경로 추가
    subContent: {
      ko: '입력 단위 독립 판단으로 서버 확장 시 세션 공유가 필요 없는 유연한 구조입니다.',
      en: 'A flexible architecture that does not require session sharing when scaling servers due to input-level independent decisions.',
      ja: '入力単位で独立判断を行うため、サーバー拡張時にセッション共有が不要な柔軟な構造です。',
      zh: '由于以输入单元进行独立判断，服务器扩展时无需会话共享，结构灵活。',
      fr: 'Grâce à une prise de décision indépendante par unité d’entrée, cette architecture flexible ne nécessite aucun partage de session lors de la montée en charge.',
      sw: 'Kwa sababu ya maamuzi huru kwa kila ingizo, muundo huu ni rahisi na hauhitaji kushiriki vikao wakati wa kupanua seva.',
    },
  },
  {
    title: {
      ko: '실환경 적용 참고',
      en: 'Real-world Deployment Notes',
      ja: '実環境適用の参考',
      zh: '实际环境应用说明',
      fr: 'Notes pour le déploiement réel',
      sw: 'Maelezo ya Utekelezaji Halisi',
    },
    content: {
      ko: `본 프로젝트는 PoC(Proof of Concept) 단계입니다. 실제 센서 연동 시에도 입력 소스만 교체하면 동일한 전처리 및 추론 로직을 유지할 수 있으며 추가 학습 없이도 즉시 적용 가능합니다.`,
      en: `This project is at the Proof of Concept (PoC) stage. Even when integrating real sensors, the same preprocessing and inference logic can be maintained by simply replacing the input source, allowing immediate application without additional training.`,
      ja: `本プロジェクトはPoC（Proof of Concept）段階です。実際のセンサー連動時も入力ソースを置き換えるだけで同一の前処理および推論ロジックを維持でき、追加学習なしで即時適用可能です。`,
      zh: `本项目处于PoC（概念验证）阶段。即使在实际传感器接入时，也只需替换输入源即可保持相同的预处理和推理逻辑，无需额外训练即可立即应用。`,
      fr: `Ce projet est au stade de preuve de concept (PoC). Même lors de l’intégration de capteurs réels, il suffit de remplacer la source d’entrée pour conserver les mêmes logiques de prétraitement et d’inférence, sans réentraînement.`,
      sw: `Mradi huu uko katika hatua ya PoC (Proof of Concept). Hata wakati wa kuunganisha vihisi halisi, kubadilisha chanzo cha ingizo pekee kunatosha kudumisha uchakataji na utabiri sawa bila mafunzo ya ziada.`,
    },
  },
  {
    title: {
      ko: 'FAQ',
      en: 'FAQ',
      ja: 'FAQ',
      zh: '常见问题',
      fr: 'FAQ',
      sw: 'Maswali Yanayoulizwa Mara kwa Mara',
    },
    content: {
      ko: `1. 실제 센서가 없어도 문제 없나요?\n답: 네, AI 판단 로직의 유효성 검증 목적이며 데이터 포맷만 맞으면 즉시 적용 가능합니다.\n2. 재학습이 필요한 경우는?\n답: 센서 종류나 설치 환경 변경, 장기 데이터 누적 후 기준 재설정 시 필요합니다.\n3. 서버 부하가 큰가요?\n답: 매우 경량화된 모델로 단일 추론은 ms 단위이며 CPU 환경에서도 충분합니다.`,
      en: `1. Is it okay without real sensors?\nA: Yes. This project validates the AI decision logic, and it can be applied immediately as long as the data format matches.\n2. When is retraining required?\nA: When sensor types or installation environments change, or when thresholds are recalibrated after long-term data accumulation.\n3. Is the server load high?\nA: No. The model is lightweight, with single inference taking milliseconds, and it runs sufficiently on CPU environments.`,
      ja: `1. 実際のセンサーがなくても問題ありませんか？\n答: はい。AI判断ロジックの有効性検証が目的であり、データフォーマットが合えば即時適用可能です。\n2. 再学習が必要な場合は？\n答: センサー種類や設置環境変更、長期データ蓄積後の基準再設定時です。\n3. サーバー負荷は大きいですか？\n答: 非常に軽量なモデルで、単一推論はms単位、CPU環境でも十分動作します。`,
      zh: `1. 没有实际传感器可以吗？\n答：可以。本项目用于验证AI判断逻辑，只要数据格式一致即可立即应用。\n2. 何时需要重新训练？\n答：当传感器类型或安装环境发生变化，或在长期数据积累后重新设定阈值时。\n3. 服务器负载高吗？\n答：不高。模型非常轻量，单次推理为毫秒级，CPU环境即可运行。`,
      fr: `1. Est-il possible de fonctionner sans capteurs réels ?\nR : Oui. L’objectif est de valider la logique de décision de l’IA, et l’application est immédiate si le format des données est respecté.\n2. Quand un réentraînement est-il nécessaire ?\nR : En cas de changement de capteur, d’environnement d’installation ou lors d’un recalibrage après accumulation de données à long terme.\n3. La charge serveur est-elle élevée ?\nR : Non. Le modèle est très léger, une inférence prenant quelques millisecondes, même sur CPU.`,
      sw: `1. Je, inawezekana bila vihisi halisi?\nJibu: Ndiyo. Lengo ni kuthibitisha mantiki ya maamuzi ya AI, na mradi unaweza kutumika mara moja ikiwa muundo wa data unalingana.\n2. Ni lini mafunzo upya yanahitajika?\nJibu: Wakati aina ya kihisi au mazingira ya usakinishaji yanabadilika, au baada ya ukusanyaji wa data wa muda mrefu.\n3. Je, mzigo wa seva ni mkubwa?\nJibu: Hapana. Modeli ni nyepesi sana, utabiri mmoja huchukua milisekunde chache na hufanya kazi vizuri hata kwenye CPU.`,
    },
  },
  {
    title: {
      ko: '핵심 요약',
      en: 'Key Summary',
      ja: '要約',
      zh: '核心总结',
      fr: 'Résumé clé',
      sw: 'Muhtasari Muhimu',
    },
    content: {
      ko: `정상 상태 기반 이상탐지 엔진 | 입력 feature → 단일 함수 호출 → 이상 여부 반환\n웹/앱 통합이 용이하도록 패키지화 완료되었습니다.`,
      en: `Normal-state-based anomaly detection engine | Input feature → Single function call → Anomaly decision returned\nPackaged for easy integration with web and mobile applications.`,
      ja: `正常状態ベースの異常検知エンジン | 入力特徴量 → 単一関数呼び出し → 異常判定返却\nWeb／アプリ統合が容易な形でパッケージ化されています.`,
      zh: `基于正常状态的异常检测引擎 | 输入特征 → 单一函数调用 → 返回异常判断\n已完成封装，便于Web与App集成。`,
      fr: `Moteur de détection d’anomalies basé sur l’état normal | Caractéristiques en entrée → Appel de fonction unique → Retour du statut d’anomalie\nConditionné pour une intégration facile aux applications web et mobiles.`,
      sw: `Injini ya utambuzi wa hitilafu inayotegemea hali ya kawaida | Kipengele cha ingizo → Mwito mmoja wa kazi → Kurudisha hali ya hitilafu\nImefungashwa kwa urahisi wa kuunganishwa na mifumo ya wavuti na programu.`,
    },
  },
];

const Account = () => {
  const { down } = useBreakpoints();
  const isMobile = down('md');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { language, themeMode } = useContext(SettingsContext);

  const getT = (obj: MultiText | undefined) => {
    if (!obj) return '';
    return obj[language] || obj['en'] || Object.values(obj)[0];
  };

  /**
   * 테마에 따른 이미지 URL 반환 함수
   */
  const getImageUrl = (section: Section) => {
    // 다크모드이고 전용 이미지가 있을 때
    if (themeMode === 'dark' && section.imageDark) {
      return section.imageDark;
    }
    // 기본 이미지 반환
    return section.image;
  };

  const titleMap: MultiText = {
    ko: '시스템 가이드',
    en: 'System Guide',
    ja: 'システムガイド',
    zh: '系统指南',
    fr: 'Guide du Système',
    sw: 'Mwongozo wa Mfumo',
  };

  const contentsLabelMap: MultiText = {
    ko: '목차',
    en: 'Contents',
    ja: '目次',
    zh: '目录',
    fr: 'Sommaire',
    sw: 'Yaliyomo',
  };

  const currentSection = sections[selectedIndex];

  return (
    <AccountsProvider>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: themeMode === 'dark' ? 'background.default' : '#f5f5f5',
          py: isMobile ? 2 : 8,
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
            {getT(titleMap)}
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              height: isMobile ? 'auto' : '800px',
              borderRadius: 4,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                width: isMobile ? '100%' : '240px',
                bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'grey.50',
                borderRight: isMobile ? 'none' : '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  {getT(contentsLabelMap)}
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Box>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                <List disablePadding>
                  {sections.map((section, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 0.3 }}>
                      <ListItemButton
                        selected={selectedIndex === index}
                        onClick={() => setSelectedIndex(index)}
                        sx={{
                          borderRadius: '8px',
                          '&.Mui-selected': { bgcolor: 'primary.main', color: 'white' },
                        }}
                      >
                        <ListItemText
                          primary={`${index + 1}. ${getT(section.title)}`}
                          primaryTypographyProps={{
                            fontWeight: selectedIndex === index ? 'bold' : 'medium',
                            fontSize: '0.8rem',
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: isMobile ? 3 : 6,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {getT(currentSection.title)}
              </Typography>
              <Divider sx={{ mb: 4 }} />
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-line',
                  lineHeight: 1.8,
                  fontSize: '1.05rem',
                  color: 'text.secondary',
                  mb: currentSection.image ? 4 : 0,
                }}
              >
                {getT(currentSection.content)}
              </Typography>
              {currentSection.image && (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                  <Box
                    component="img"
                    src={getImageUrl(currentSection)}
                    sx={{
                      width: '100%',
                      maxWidth: '600px',
                      borderRadius: 2,
                      boxShadow: 2,
                      // 다크모드 전용 이미지가 없을 경우를 대비한 자동 반전 필터 (선택 사항)
                      filter:
                        themeMode === 'dark' && !currentSection.imageDark
                          ? 'invert(1) hue-rotate(180deg)'
                          : 'none',
                    }}
                  />
                </Box>
              )}
              {currentSection.subContent && (
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="primary.main"
                  sx={{
                    mt: 2,
                    textAlign: 'center',
                  }}
                >
                  {getT(currentSection.subContent)}
                </Typography>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </AccountsProvider>
  );
};

const AccountWrapper = () => (
  <SettingsProvider>
    <Account />
  </SettingsProvider>
);

export default AccountWrapper;
