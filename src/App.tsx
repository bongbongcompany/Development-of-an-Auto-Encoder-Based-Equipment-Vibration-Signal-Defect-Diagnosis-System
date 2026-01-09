import { useEffect, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
// 1. 내부 모듈/컨텍스트끼리 모으기 (알파벳 순서 권장)
import { AnalyticsProvider } from 'pages/dashboard/Analytics';
import { useSettingsContext } from 'providers/SettingsProvider';
import { REFRESH } from 'reducers/SettingsReducer';
// 2. 컴포넌트끼리 모으기
import SettingPanelToggler from 'components/settings-panel/SettingPanelToggler';
import SettingsPanel from 'components/settings-panel/SettingsPanel';

const App = () => {
  const { pathname } = useLocation();
  const { configDispatch } = useSettingsContext();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useLayoutEffect(() => {
    configDispatch({ type: REFRESH });
  }, [configDispatch]);

  /* 추후 추론 결과 처리 시 참고: 
    0은 정상, 1은 비정상으로 판정 로직을 구현해야 함.
  */

  return (
    <AnalyticsProvider>
      <Outlet />
      <SettingsPanel />
      <SettingPanelToggler />
    </AnalyticsProvider>
  );
};

export default App;
