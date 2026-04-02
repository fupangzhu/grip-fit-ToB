
import { createRoot } from 'react-dom/client';
import DesktopApp from './apps/desktop/App.tsx';
import MobileApp from './apps/mobile/App.tsx';
import { detectAppVariant } from './runtime/appVariant';
import './styles/index.css';

const variant = detectAppVariant();
const App = variant === 'mobile' ? MobileApp : DesktopApp;

document.documentElement.dataset.appVariant = variant;
document.body.dataset.appVariant = variant;

createRoot(document.getElementById('root')!).render(<App />);
  
