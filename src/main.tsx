import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { MotionProvider } from './motion/components/MotionProvider';

createRoot(document.getElementById('root')!).render(<MotionProvider><App /></MotionProvider>);
