import { usePwaInstall } from '@hooks/usePwaInstall';
import AppHomePage from './AppHomePage';
import LandingHomePage from './LandingHomePage';

export default function HomePage() {
  const { isInstalled } = usePwaInstall();
  return isInstalled ? <AppHomePage /> : <LandingHomePage />;
}
