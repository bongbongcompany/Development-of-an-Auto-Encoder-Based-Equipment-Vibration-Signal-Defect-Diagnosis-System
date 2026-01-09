import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import {
  Avatar,
  Box,
  Button,
  CssBaseline,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { blue, grey, orange } from '@mui/material/colors';
import axios from 'axios';

export const SettingsContext = createContext<any>(null);

export const translations = {
  ko: {
    title: '설정 페이지',
    accountSection: '계정 및 보안',
    displaySection: '화면 및 인터페이스',
    nickname: '닉네임',
    emailChange: '계정 정보 변경 (ID/이메일)',
    profile: '프로필 관리',
    password: '비밀번호 변경',
    modelList: 'Input Model 리스트 (CSV 관리)',
    theme: '테마 설정',
    language: '언어 설정',
    light: '라이트 모드',
    dark: '다크 모드',
    logTitle: '시스템 설정 변경 로그',
    imageChange: '이미지 변경',
    updateBtn: '변경',
    resultBtn: '결과',
    idLabel: '변경할 새 User ID',
    emailLabel: '새 이메일 주소',
    currentPwLabel: '기존 비밀번호 입력',
    newPwLabel: '새 비밀번호 입력',
    fileName: '파일명',
    resultContent: '결과내용',
    anomaly: '이상',
    unit: '건',
    total: '전체',
    rows: '행',

    // --- Analytics ---
    anomalyDetectionTitle: '이상 탐지 (AutoEncoder)',
    status: '상태',
    analyzing: '분석 중...',

    // --- CSV 업로드 ---
    fileSelect: '파일 선택',
    noFileSelected: '선택된 파일 없음',
    uploadAndInfer: '업로드 & 추론',

    // --- 로그인 ---
    loginTitle: '로그인',
    loginEmailLabel: '이메일',
    loginPwLabel: '비밀번호',
    loginBtn: '로그인',
    loggingIn: '로그인 중...',
    noAccount: '계정이 없으신가요?',
    signupBtn: '회원가입',
    alreadyLoggedIn: '이미 로그인되어 있습니다.',
    goHome: '홈으로 이동',
    logoutBtn: '로그아웃',
    themeChanged: '테마로 변경되었습니다.',
    langChanged: '언어 설정이 변경되었습니다: ',
    logDelete: '데이터 삭제 완료',
    logProfileUpdate: '프로필 사진 업데이트 완료',
    logProfileDelete: '프로필 사진 삭제 완료',
    logDetailCheck: '상세 확인',
    lang_ko: '한국어',
    lang_en: '영어',
    lang_ja: '일본어',
    lang_zh: '중국어',
    lang_fr: '프랑스어',
    lang_sw: '스와힐리어',
    currentNickname: '현재 닉네임', // 추가
    newNicknamePlaceholder: '새 닉네임 입력', // 추가
    deleteBtn: '삭제',
    nameLabel: '이름', // 추가
    passwordLabel: '비밀번호', // 추가
    createAccountBtn: '계정 생성',
    creating: '생성 중...',
    orUseEmail: '또는 이메일 사용',
    analysisResult: '분석 결과',
    uploadPrompt: '업로드 후 결과가 표시됩니다.',
    noData: '데이터 없음',
    anomalyStatus: '이상 감지',
    normalStatus: '정상',
    chatLog: '채팅 기록',
    inputPlaceholder: '메시지를 입력하세요...',
  },

  en: {
    title: 'Settings Page',
    accountSection: 'Account & Security',
    displaySection: 'Display & Interface',
    nickname: 'Nickname',
    emailChange: 'Account Update (ID/Email)',
    profile: 'Profile',
    password: 'Change Password',
    modelList: 'Input Model List',
    theme: 'Theme Setting',
    language: 'Language',
    light: 'Light Mode',
    dark: 'Dark Mode',
    logTitle: 'System Change Logs',
    imageChange: 'Change Image',
    updateBtn: 'Update',
    resultBtn: 'Result',
    idLabel: 'New User ID',
    emailLabel: 'New Email Address',
    currentPwLabel: 'Enter Current Password',
    newPwLabel: 'Enter New Password',
    fileName: 'File Name',
    resultContent: 'Result Content',
    anomaly: 'Anomaly',
    unit: 'cases',
    total: 'Total',
    rows: 'rows',

    // --- Analytics ---
    anomalyDetectionTitle: 'Anomaly Detection (AutoEncoder)',
    status: 'Status',
    analyzing: 'Analyzing...',

    // --- CSV 업로드 ---
    fileSelect: 'Choose File',
    noFileSelected: 'No file selected',
    uploadAndInfer: 'Upload & Infer',

    // --- 로그인 ---
    loginTitle: 'Log in',
    loginEmailLabel: 'Email',
    loginPwLabel: 'Password',
    loginBtn: 'Log in',
    loggingIn: 'Logging in...',
    noAccount: "Don't have an account?",
    signupBtn: 'Sign up',
    alreadyLoggedIn: 'You are already logged in.',
    goHome: 'Go to Home',
    logoutBtn: 'Logout',
    themeChanged: 'theme mode applied.',
    langChanged: 'Language changed to: ',
    logDelete: 'Data deleted successfully',
    logProfileUpdate: 'Profile image updated',
    logProfileDelete: 'Profile image removed',
    logDetailCheck: 'Details checked',
    lang_ko: 'Korean',
    lang_en: 'English',
    lang_ja: 'Japanese',
    lang_zh: 'Chinese',
    lang_fr: 'French',
    lang_sw: 'Swahili',
    currentNickname: 'Current Nickname', // 추가
    newNicknamePlaceholder: 'Enter New Nickname', // 추가
    deleteBtn: 'Delete',
    nameLabel: 'Name',
    passwordLabel: 'Password',
    createAccountBtn: 'Create Account',
    creating: 'create...',
    orUseEmail: 'or use email',
    analysisResult: 'Window Results',
    uploadPrompt: 'Results will appear after upload.',
    noData: 'NO DATA',
    anomalyStatus: 'ANOMALY',
    normalStatus: 'NORMAL',
    chatLog: 'Chat History',
    inputPlaceholder: 'Type a message...',
  },

  ja: {
    title: '設定ページ',
    accountSection: 'アカウントとセキュリティ',
    displaySection: '画面とインターフェース',
    nickname: 'ニックネーム',
    emailChange: 'アカウント情報変更 (ID/メール)',
    profile: 'プロフィール管理',
    password: 'パスワード変更',
    modelList: 'モデルリスト',
    theme: 'テーマ設定',
    language: '言語設定',
    light: 'ライトモード',
    dark: 'ダークモード',
    logTitle: 'システム設定変更ログ',
    imageChange: '画像変更',
    updateBtn: '変更',
    resultBtn: '結果',
    idLabel: '新しいユーザーID',
    emailLabel: '新しいメールアドレス',
    currentPwLabel: '現在のパスワードを入力',
    newPwLabel: '新しいパスワードを入力',
    fileName: 'ファイル名',
    resultContent: '結果内容',
    anomaly: '異常',
    unit: '件',
    total: '全体',
    rows: '行',

    // --- Analytics ---
    anomalyDetectionTitle: '異常検知 (AutoEncoder)',
    status: '状態',
    analyzing: '分析中...',

    // --- CSV 업로드 ---
    fileSelect: 'ファイル選択',
    noFileSelected: 'ファイルが選択されていません',
    uploadAndInfer: 'アップロード＆推論',

    // --- 로그인 ---
    loginTitle: 'ログイン',
    loginEmailLabel: 'メールアドレス',
    loginPwLabel: 'パスワード',
    loginBtn: 'ログイン',
    loggingIn: 'ログイン中...',
    noAccount: 'アカウントをお持ちではありませんか？',
    signupBtn: '新規登録',
    alreadyLoggedIn: 'すでにログインしています。',
    goHome: 'ホームへ戻る',
    logoutBtn: 'ログアウト',
    themeChanged: 'テーマに変更されました。',
    langChanged: '言語設定が変更されました: ',
    logDelete: 'データの削除が完了しました',
    logProfileUpdate: 'プロフィール画像が更新されました',
    logProfileDelete: 'プロフィール画像が削除されました',
    logDetailCheck: '詳細確認',
    lang_ko: '韓国語',
    lang_en: '英語',
    lang_ja: '日本語',
    lang_zh: '中国語',
    lang_fr: 'フランス語',
    lang_sw: 'スワヒリ語',
    currentNickname: '現在のニックネーム',
    newNicknamePlaceholder: '新しいニックネームを入力',
    deleteBtn: '削除',
    nameLabel: '名前',
    passwordLabel: 'パスワード',
    createAccountBtn: 'アカウント作成',
    creating: '作成中...',
    orUseEmail: 'またはメールアドレスを使用',
    analysisResult: '分析結果',
    uploadPrompt: 'アップロード後に結果が表示されます。',
    noData: 'データなし',
    anomalyStatus: '異常あり',
    normalStatus: '正常',
    chatLog: 'チャット履歴',
    inputPlaceholder: 'メッセージを入力してください...',
  },

  zh: {
    title: '设置页面',
    accountSection: '账户与安全',
    displaySection: '显示与界面',
    nickname: '昵称',
    emailChange: '更改账户信息 (ID/邮箱)',
    profile: '个人资料管理',
    password: '修改密码',
    modelList: '输入模型列表',
    theme: '主题设置',
    language: '语言设置',
    light: '浅色模式',
    dark: '深色模式',
    logTitle: '系统设置变更日志',
    imageChange: '更改图片',
    updateBtn: '更改',
    resultBtn: '结果',
    idLabel: '新用户 ID',
    emailLabel: '新电子邮件地址',
    currentPwLabel: '输入当前密码',
    newPwLabel: '输入新密码',
    fileName: '文件名',
    resultContent: '结果内容',
    anomaly: '异常',
    unit: '件',
    total: '总计',
    rows: '行',

    // --- Analytics ---
    anomalyDetectionTitle: '异常检测 (AutoEncoder)',
    status: '状态',
    analyzing: '分析中...',

    // --- CSV 업로드 ---
    fileSelect: '选择文件',
    noFileSelected: '未选择文件',
    uploadAndInfer: '上传并推理',

    // --- 로그인 ---
    loginTitle: '登录',
    loginEmailLabel: '电子邮件',
    loginPwLabel: '密码',
    loginBtn: '登录',
    loggingIn: '正在登录...',
    noAccount: '没有账号？',
    signupBtn: '注册',
    alreadyLoggedIn: '您已经登录。',
    goHome: '回到首页',
    logoutBtn: '退出登录',
    themeChanged: '主题已更改。',
    langChanged: '语言设置已更改: ',
    logDelete: '数据删除完成',
    logProfileUpdate: '个人资料照片更新完成',
    logProfileDelete: '个人资料照片删除完成',
    logDetailCheck: '详情确认',
    lang_ko: '韩语',
    lang_en: '英语',
    lang_ja: '日语',
    lang_zh: '中文',
    lang_fr: '法语',
    lang_sw: '斯瓦希里语',
    currentNickname: '当前昵称',
    newNicknamePlaceholder: '输入新昵称',
    deleteBtn: '删除',
    nameLabel: '姓名',
    passwordLabel: '密码',
    troubleSigningIn: '登录遇到困难？',
    createAccountBtn: '创建账号',
    creating: '正在创建...',
    orUseEmail: '或使用电子邮件',
    analysisResult: '分析结果',
    uploadPrompt: '上传后将显示结果。',
    noData: '无数据',
    anomalyStatus: '异常',
    normalStatus: '正常',
    chatLog: '聊天记录',
    inputPlaceholder: '请输入消息...', // <-- 이것도 확인!
  },

  fr: {
    title: 'Page de Paramètres',
    accountSection: 'Compte et Sécurité',
    displaySection: 'Affichage et Interface',
    nickname: 'Pseudo',
    emailChange: 'Modifier ID/E-mail',
    profile: 'Profil',
    password: 'Changer le mot de passe',
    modelList: 'Liste des modèles',
    theme: 'Thème',
    language: 'Langue',
    light: 'Mode Clair',
    dark: 'Mode Sombre',
    logTitle: 'Journal des modifications',
    imageChange: "Modifier l'image",
    updateBtn: 'Modifier',
    resultBtn: 'Résultat',
    idLabel: 'Nouvel identifiant',
    emailLabel: 'Nouvelle adresse e-mail',
    currentPwLabel: 'Entrez le mot de passe actuel',
    newPwLabel: 'Entrez le nouveau mot de passe',
    fileName: 'Nom du fichier',
    resultContent: 'Détails du résultat',
    anomaly: 'Anomalie',
    unit: 'cas',
    total: 'Total',
    rows: 'lignes',

    // --- Analytics ---
    anomalyDetectionTitle: 'Détection d’anomalies (AutoEncoder)',
    status: 'Statut',
    analyzing: 'Analyse en cours...',

    // --- CSV 업로드 ---
    fileSelect: 'Choisir un fichier',
    noFileSelected: 'Aucun fichier sélectionné',
    uploadAndInfer: 'Téléverser et analyser',

    // --- 로그인 ---
    loginTitle: 'Connexion',
    loginEmailLabel: 'E-mail',
    loginPwLabel: 'Mot de passe',
    loginBtn: 'Se connecter',
    loggingIn: 'Connexion...',
    noAccount: "Vous n'avez pas de compte ?",
    signupBtn: "S'inscrire",
    alreadyLoggedIn: 'Vous êtes déjà connecté.',
    goHome: "Aller à l'accueil",
    logoutBtn: 'Se déconnecter',
    themeChanged: 'le thème a été appliqué.',
    langChanged: 'La langue a été changée en : ',
    logDelete: 'Suppression des données terminée',
    logProfileUpdate: 'Photo de profil mise à jour',
    logProfileDelete: 'Photo de profil supprimée',
    logDetailCheck: 'Vérification des détails',
    lang_ko: 'Coréen',
    lang_en: 'Anglais',
    lang_ja: 'Japonais',
    lang_zh: 'Chinois',
    lang_fr: 'Français',
    lang_sw: 'Swahili',
    currentNickname: 'Surnom Actuel',
    newNicknamePlaceholder: 'Entrez un nouveau surnom',
    deleteBtn: 'Supprimer',
    nameLabel: 'Nom',
    passwordLabel: 'Mot de passe',
    createAccountBtn: 'Créer un compte',
    creating: 'Création...',
    orUseEmail: 'ou utiliser un e-mail',
    analysisResult: 'Résultats de l’analyse',
    uploadPrompt: 'Les résultats apparaîtront après le téléversement.',
    noData: 'PAS DE DONNÉES',
    anomalyStatus: 'ANOMALIE',
    normalStatus: 'NORMAL',
    chatLog: 'Historique du chat',
    inputPlaceholder: 'Tapez un message...',
  },

  sw: {
    title: 'Ukurasa wa Mipangilio',
    accountSection: 'Akaunti na Usalama',
    displaySection: 'Onyesho na Kiolesura',
    nickname: 'Jina la Utani',
    emailChange: 'Badilisha Kitambulisho/Barua Pepe',
    profile: 'Usimamizi wa Wasifu',
    password: 'Badilisha Nywila',
    modelList: 'Orodha ya Mifano',
    theme: 'Mipangilio ya Mandhari',
    language: 'Mipangilio ya Lugha',
    light: 'Njia ya Mwanga',
    dark: 'Njia ya Giza',
    logTitle: 'Kumbukumbu za Mabadiliko',
    imageChange: 'Badilisha Picha',
    updateBtn: 'Badilisha',
    resultBtn: 'Matokeo',
    idLabel: 'Kitambulisho Kipya',
    emailLabel: 'Barua Pepe Mpya',
    currentPwLabel: 'Ingiza Nywila ya Sasa',
    newPwLabel: 'Ingiza Nywila Mpya',
    fileName: 'Jina la faili',
    resultContent: 'Maudhui ya matokeo',
    anomaly: 'Hitilafu',
    unit: 'visa',
    total: 'Jumla',
    rows: 'safu',

    // --- Analytics ---
    anomalyDetectionTitle: 'Ugunduzi wa Hitilafu (AutoEncoder)',
    status: 'Hali',
    analyzing: 'Inachambua...',

    // --- CSV 업로드 ---
    fileSelect: 'Chagua faili',
    noFileSelected: 'Hakuna faili lililochaguliwa',
    uploadAndInfer: 'Pakia na Tambua',

    // --- 로그인 ---
    loginTitle: 'Ingia',
    loginEmailLabel: 'Barua Pepe',
    loginPwLabel: 'Nywila',
    loginBtn: 'Ingia',
    loggingIn: 'Inaingia...',
    noAccount: 'Huna akaunti?',
    signupBtn: 'Jisajili',
    alreadyLoggedIn: 'Tayari umeingia.',
    goHome: 'Nenda Nyumbani',
    logoutBtn: 'Ondoka',
    themeChanged: 'mandhari imebadilishwa.',
    langChanged: 'Mipangilio ya lugha imebadilishwa kuwa: ',
    logDelete: 'Ufutaji wa data umekamilika',
    logProfileUpdate: 'Picha ya wasifu imesasishwa',
    logProfileDelete: 'Picha ya wasifu imefutwa',
    logDetailCheck: 'Angalia maelezo',
    lang_ko: 'Kikorea',
    lang_en: 'Kiingereza',
    lang_ja: 'Kijapani',
    lang_zh: 'Kichina',
    lang_fr: 'Kifaransa',
    lang_sw: 'Kiswahili',
    currentNickname: 'Jina la Utani la Sasa',
    newNicknamePlaceholder: 'Ingiza jina jipya la utani',
    deleteBtn: 'Futa',
    nameLabel: 'Jina',
    passwordLabel: 'Nywila',
    createAccountBtn: 'Tengeneza Akaunti',
    creating: 'Inatengeneza...',
    orUseEmail: 'au tumia barua pepe',
    analysisResult: 'Matokeo ya Uchambuzi',
    uploadPrompt: 'Matokeo yataonekana baada ya kupakia.',
    noData: 'HAKUNA DATA',
    anomalyStatus: 'HITILAFU',
    normalStatus: 'KAWAIDA',
    chatLog: 'Historia ya gumzo',
    inputPlaceholder: 'Andika ujumbe...',
  },
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    () => (sessionStorage.getItem('session_theme') as 'light' | 'dark') || 'light',
  );
  const [language, setLanguage] = useState(() => sessionStorage.getItem('session_lang') || 'ko');

  useEffect(() => {
    sessionStorage.setItem('session_theme', themeMode);
    window.dispatchEvent(new Event('settingsUpdate'));
  }, [themeMode]);

  useEffect(() => {
    sessionStorage.setItem('session_lang', language);
    window.dispatchEvent(new Event('settingsUpdate'));
  }, [language]);

  const theme = useMemo(() => {
    // 테마 변경 시 body 배경색 강제 동기화 (지연 현상 방지)
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = themeMode === 'dark' ? '#121212' : '#f5f5f5';
      document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }

    return createTheme({
      palette: {
        mode: themeMode,
        primary: { main: blue[500] },
        background: {
          default: themeMode === 'dark' ? '#121212' : '#f5f5f5',
          paper: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              transition: 'background-color 0.3s ease, color 0.3s ease',
            },
          },
        },
      },
    } as any); // 이 부분에 'as any'를 추가하여 shadows 미지정 에러를 해결합니다.
  }, [themeMode]);

  return (
    <SettingsContext.Provider value={{ themeMode, setThemeMode, language, setLanguage }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SettingsContext.Provider>
  );
};

const SettingRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box
    sx={{
      display: 'flex',
      border: (theme) => `1px solid ${theme.palette.divider}`,
      mt: '-1px',
    }}
  >
    <Box
      sx={{
        width: 160,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : grey[100]),
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="body2" fontWeight="bold">
        {label}
      </Typography>
    </Box>
    <Box sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>{children}</Box>
  </Box>
);

const SystemSettings = () => {
  const { language, setLanguage, themeMode, setThemeMode } = useContext(SettingsContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [changeLogs, setChangeLogs] = useState<
    { time: string | Date; key: string; value: string }[]
  >([]);
  const [uploadList, setUploadList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [account, setAccount] = useState(() => {
    // 281-282행을 아래와 같이 한 줄로 합칩니다.
    const savedAccount = sessionStorage.getItem('session_account') || localStorage.getItem('user');

    // 반면, 아래 삼항 연산자는 길기 때문에 줄바꿈 규격을 유지합니다.
    return savedAccount
      ? JSON.parse(savedAccount)
      : { user_id: '', email: '', nickname: '', profileImage: '' };
  });
  const fetchUploads = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/fetch-db');
      setUploadList(res.data.data || []);
    } catch (err) {
      console.error('Data load error', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryFromBackend = async () => {
    // [괄호 시작: 함수]
    try {
      // 404가 발생한다면 백엔드에서 POST /api/upload가 정의되어 있는지 확인이 필요합니다.
      // 보통 데이터를 가져오는 API는 GET을 사용하거나 경로가 다를 수 있습니다.
      const res = await axios.get('/api/fetch-db');

      if (res.data && res.data.data) {
        setUploadList(res.data.data);
      } else {
        setUploadList(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('백env 호출 실패:', error);
    }
    // [괄호 끝: 함수]
  };

  const handleUpdate = async (type: 'ID_EMAIL' | 'PW' | 'NICKNAME') => {
    // [괄호 시작: 함수]
    const localData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!localData || !token) {
      alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
      return;
    }

    const currentActiveUser = JSON.parse(localData);
    // 이미지 구조에 따라 식별자인 user_id(이메일)를 가져옵니다.
    const activeUserId = currentActiveUser.user_id;

    const payload = {
      // [괄호 시작: 객체]
      user_id: String(activeUserId), // 백엔드에서 WHERE user_id = ? 로 찾을 수 있게 함
      new_nickname: type === 'NICKNAME' ? newNickname.trim() : '',
      new_user_id: type === 'ID_EMAIL' ? newUserId.trim() : '',
      new_email: type === 'ID_EMAIL' ? newEmail.trim() : '',
      current_password: type === 'PW' ? currentPw : '',
      new_password: type === 'PW' ? newPw : '',
      // [괄호 끝: 객체]
    };

    try {
      // [괄호 시작: try]
      const res = await axios.patch('/api/auth/updateAccount', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        alert(res.data.message);

        if (res.data.user) {
          const updatedData = { ...currentActiveUser, ...res.data.user };
          const stringData = JSON.stringify(updatedData);

          localStorage.setItem('user', stringData);
          sessionStorage.setItem('session_account', stringData);

          setAccount(updatedData);
          window.dispatchEvent(new Event('userUpdate'));

          // 필드 초기화 (괄호 주의)
          if (type === 'NICKNAME') setNewNickname('');
          if (type === 'ID_EMAIL') {
            setNewUserId('');
            setNewEmail('');
          } else if (type === 'PW') {
            setCurrentPw('');
            setNewPw('');
          }
        }
      }
      // [괄호 끝: try]
    } catch (err: any) {
      // [괄호 시작: catch]
      const data = err.response?.data;
      const errorMsg = data?.message || data?.detail || '사용자를 찾을 수 없습니다(404).';
      console.error('업데이트 에러:', err);
      alert(errorMsg);
      // [괄호 끝: catch]
    }
  }; // [괄호 끝: 함수]

  const location = useLocation();

  useEffect(() => {
    // state가 있고 scrollToBottom이 true일 때만 실행
    if (location.state?.scrollToBottom) {
      // 렌더링 동기화를 위해 브라우저의 다음 프레임에서 실행
      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth', // 부드러운 이동
        });
      });

      // (선택 사항) 뒤로가기 시 다시 스크롤되는 것을 방지하기 위해 state 초기화
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    // 최신 스토리지 데이터를 account 상태에 동기화하는 함수
    const syncAccountData = () => {
      const saved = localStorage.getItem('user') || sessionStorage.getItem('session_account');
      if (saved) {
        setAccount(JSON.parse(saved));
      } else {
        // 로그아웃 상태일 경우 빈 객체로 설정하여 렌더링 에러 방지
        setAccount({ user_id: '', email: '', nickname: '', profileImage: '' });
      }
    };

    const loadInitialData = async () => {
      syncAccountData(); // 1. 현재 계정 정보 로드
      await fetchUploads(); // 2. 업로드 내역 로드
      await fetchHistoryFromBackend(); // 3. 분석 이력 로드
    };

    loadInitialData();

    // 다른 곳에서 'userUpdate' 이벤트를 발생시키면 내 화면도 갱신
    window.addEventListener('userUpdate', syncAccountData);
    // 브라우저 다른 탭에서 로그인/로그아웃 했을 때 감지
    window.addEventListener('storage', syncAccountData);

    return () => {
      // 컴포넌트가 사라질 때 리스너 제거 (메모리 누수 방지)
      window.removeEventListener('userUpdate', syncAccountData);
      window.removeEventListener('storage', syncAccountData);
    };
  }, []);

  // 1. 컴포넌트 상단에 useRef 추가
  const isMounted = useRef(false);

  // 2. 언어 변경 로그 감지 useEffect
  useEffect(() => {
    // 컴포넌트가 처음 나타날(마운트될) 때는 로그를 기록하지 않음
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    // 마운트 이후, 즉 '실제 사용자가 조작'했을 때만 로그 기록
  }, [language]);

  const addLog = (key: string, value: string) => {
    setChangeLogs((prev) => [{ time: new Date(), key, value }, ...prev].slice(0, 50));
  };

  const handleDelete = async (sha256: string) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/upload/${sha256}`);
      addLog('logDelete', 'CSV');
      fetchUploads();
    } catch {
      alert('삭제 실패');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // 파일 선택을 취소한 경우 아무 작업도 하지 않음
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;

      // A. 현재 페이지 UI 업데이트
      setAccount((prev: any) => ({ ...prev, profileImage: base64Image }));

      // B. 로컬 스토리지 저장 (새로고침 유지용)
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        userData.profileImage = base64Image;
        localStorage.setItem('user', JSON.stringify(userData));

        // C. ProfileMenu 등 다른 컴포넌트에 실시간 알림
        window.dispatchEvent(new Event('userUpdate'));
        addLog('logProfileUpdate', '');
      }
    };
    reader.readAsDataURL(file);
  };

  // 2. 이미지 삭제(취소) 함수
  const handleRemoveImage = () => {
    if (!window.confirm('프로필 사진을 삭제하시겠습니까?')) return;

    // A. UI 상태 초기화
    setAccount((prev: any) => ({ ...prev, profileImage: '' }));

    // B. 로컬 스토리지 데이터 비우기
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      userData.profileImage = ''; // 여기에 붙어있던 공백 제거
      localStorage.setItem('user', JSON.stringify(userData));
      // C. 실시간 동기화 이벤트 발생
      window.dispatchEvent(new Event('userUpdate'));
      addLog('logProfileDelete', '');
    }

    // input 값 초기화 (같은 파일을 다시 올릴 수 있도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusText = (file: any) => {
    if (!file) return 'NO DATA';

    // 백엔드 DB에서 가져오는 실제 필드명 (abnormal_count)
    const count = file.user_id;

    // 데이터가 정말 없거나 분석 전인 경우

    // Analytics.tsx와 로직 동기화 (0보다 크면 ANOMALY)
    const status = count > 0 ? 'ANOMALY' : 'NORMAL';

    // ✅ 오타 제거: ${count}} 에서 마지막 } 하나를 삭제함
    return `${status}`;
  };

  const t = (translations as any)[language] || translations.ko;

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Typography variant="h4" textAlign="center" fontWeight="bold" mb={4}>
        {t.title}
      </Typography>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} maxWidth={1400} mx="auto">
        <Paper sx={{ flex: 1, p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <AccountCircleIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              {t.accountSection}
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          <SettingRow label={t.profile}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar src={account.profileImage} sx={{ width: 56, height: 56 }}>
                {!account.profileImage && (account.nickname || 'U')[0]}
              </Avatar>
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
              />

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t.imageChange}
                </Button>
                {account.profileImage && (
                  <Button variant="outlined" color="error" size="small" onClick={handleRemoveImage}>
                    {t.deleteBtn}
                  </Button>
                )}
              </Stack>
            </Stack>
          </SettingRow>

          <SettingRow label={t.nickname}>
            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              {/* 현재 닉네임 표시 (수정 불가) */}
              <TextField
                size="small"
                label={t.currentNickname || '현재 닉네임'}
                value={account.nickname}
                disabled
                sx={{ flex: 1 }}
              />
              {/* 새로 변경할 닉네임 입력 */}
              <TextField
                size="small"
                label={t.newNicknamePlaceholder || '새 닉네임 입력'}
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Button variant="contained" size="small" onClick={() => handleUpdate('NICKNAME')}>
                {t.updateBtn}
              </Button>
            </Stack>
          </SettingRow>

          <SettingRow label={t.emailChange}>
            <Stack spacing={1} sx={{ width: '100%' }}>
              <TextField
                size="small"
                fullWidth
                label={t.idLabel}
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  size="small"
                  fullWidth
                  label={t.emailLabel}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleUpdate('ID_EMAIL')}
                  sx={{ minWidth: '80px' }}
                >
                  {t.updateBtn}
                </Button>
              </Stack>
            </Stack>
          </SettingRow>

          {/* 비밀번호 변경 섹션 */}
          <SettingRow label={t.password}>
            <Stack spacing={1} sx={{ width: '100%' }}>
              <TextField
                size="small"
                type="password"
                fullWidth
                label={t.currentPwLabel}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  size="small"
                  type="password"
                  fullWidth
                  label={t.newPwLabel}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleUpdate('PW')}
                  sx={{ minWidth: '80px' }}
                >
                  {t.updateBtn}
                </Button>
              </Stack>
            </Stack>
          </SettingRow>

          <SettingRow label={t.modelList}>
            <Box
              sx={{
                width: '100%',
                maxHeight: 200,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {loading ? (
                <Typography variant="caption" sx={{ textAlign: 'center' }}>
                  데이터 로딩 중...
                </Typography>
              ) : uploadList.length > 0 ? (
                uploadList.map((file, i) => (
                  <Box
                    // ✅ 수정: sha256이 중복될 수 있으므로 인덱스(i)를 붙여 고유한 Key 생성
                    key={`${file.sha256}-${i}`}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      mb: 1,
                      borderBottom: '1px solid #ddd',
                      pb: 1,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 'bold', color: 'primary.main' }}
                      >
                        {t.fileName}: {file.original_filename || file.filename || '이름 없는 파일'}
                      </Typography>

                      <Stack direction="row" spacing={0.5}>
                        <Button
                          size="small"
                          variant="text"
                          sx={{ fontSize: '0.7rem' }}
                          onClick={() => addLog('logDetailCheck', file.original_filename || 'File')}
                        >
                          {t.resultBtn}
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          // ✅ 수정: 삭제 시에도 정확한 인덱스나 ID 참조 권장
                          onClick={() => handleDelete(file.sha256)}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        display: 'block',
                        // ✅ 수정: Prettier 규칙에 따른 엄격한 계단식 정렬
                        color:
                          !file || file.abnormal_count == null
                            ? '#888'
                            : file.abnormal_count > 0
                              ? '#cf1322'
                              : '#237804',
                        fontWeight: file && file.abnormal_count > 0 ? 800 : 500,
                      }}
                    >
                      {t.resultContent}: {getStatusText(file)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="caption" sx={{ textAlign: 'center', py: 1 }}>
                  업로드된 CSV가 없습니다.
                </Typography>
              )}
            </Box>
          </SettingRow>
        </Paper>

        <Paper sx={{ flex: 1, p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <DisplaySettingsIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              {t.displaySection}
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <SettingRow label={t.theme}>
            <RadioGroup
              row
              value={themeMode}
              onChange={(e) => {
                const nextMode = e.target.value as any;
                setThemeMode(nextMode); // 테마 변경
                addLog('themeChanged', nextMode); // [추가] 로그 기록 (value에 'light' 또는 'dark'가 들어감)
              }}
            >
              <FormControlLabel value="light" control={<Radio size="small" />} label={t.light} />
              <FormControlLabel value="dark" control={<Radio size="small" />} label={t.dark} />
            </RadioGroup>
          </SettingRow>
          <SettingRow label={t.language}>
            <Select
              size="small"
              fullWidth
              value={language}
              onChange={(e) => {
                const newLang = e.target.value;
                setLanguage(newLang); // 언어 상태 변경
                addLog('langChanged', newLang); // [핵심] 여기서만 로그를 남김!
              }}
            >
              <MenuItem value="ko">{t.lang_ko}</MenuItem>
              <MenuItem value="en">{t.lang_en}</MenuItem>
              <MenuItem value="ja">{t.lang_ja}</MenuItem>
              <MenuItem value="zh">{t.lang_zh}</MenuItem>
              <MenuItem value="fr">{t.lang_fr}</MenuItem>
              <MenuItem value="sw">{t.lang_sw}</MenuItem>
            </Select>
          </SettingRow>
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color={orange[800]} mb={1}>
              {t.logTitle}
            </Typography>
            <Box
              sx={{
                p: 2,
                height: 100,
                overflowY: 'auto',
                border: '1px solid #ddd',
                bgcolor: 'background.paper',
              }}
            >
              {changeLogs.map((log, i) => {
                // 1. 시간 포맷팅 설정 (Prettier 규칙에 따른 계단식 정렬)
                const localeMap: Record<string, string> = {
                  ko: 'ko-KR',
                  en: 'en-US',
                  ja: 'ja-JP',
                  zh: 'zh-CN',
                  fr: 'fr-FR',
                  sw: 'sw-KE',
                };
                const currentLocale = localeMap[language] || 'en-US';

                const timeOptions: Intl.DateTimeFormatOptions = {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                };
                const formattedTime = `[${new Date(log.time).toLocaleTimeString(currentLocale, timeOptions)}]`;

                // 2. ✅ 실시간 번역 로직: log.value가 'light'라면 t.light를 실시간으로 가져옴
                let logMessage = '';
                if (log.key === 'langChanged') {
                  // log.value가 'ko'라면 t['lang_ko']를 찾아옵니다.
                  // 사용자가 언어를 바꾸면 t값이 바뀌므로 이 메시지도 실시간으로 바뀝니다.
                  const langKey = `lang_${log.value}`;
                  const langName = t[langKey] || log.value;
                  logMessage = `${t.langChanged} ${langName}`;
                } else if (log.key === 'themeChanged') {
                  const themeName = log.value === 'light' ? t.light : t.dark;
                  logMessage = `${themeName} ${t.themeChanged}`;
                }

                // 3. 최종 렌더링
                return (
                  <Typography
                    key={`${log.time}-${i}`}
                    variant="caption"
                    display="block"
                    sx={{
                      borderBottom: '1px solid rgba(0,0,0,0.03)',
                      py: 0.5,
                      color: themeMode === 'dark' ? grey[400] : grey[700],
                    }}
                  >
                    <Box component="span" sx={{ fontWeight: 'bold', mr: 1, color: blue[500] }}>
                      {formattedTime}
                    </Box>
                    {logMessage}
                  </Typography>
                );
              })}
            </Box>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
};

export default function UserListWrapper() {
  return (
    <SettingsProvider>
      <SystemSettings />
    </SettingsProvider>
  );
}
