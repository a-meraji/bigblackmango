import { useIsAppMode } from '@hooks/useWebAppMode';
import AppHomePage from './AppHomePage';
import LandingHomePage from './LandingHomePage';

export default function HomePage() {
  const isAppMode = useIsAppMode();
  return isAppMode ? <AppHomePage /> : <LandingHomePage />;
}
