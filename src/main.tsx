import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { initSecurityGuard } from './utils/securityGuard';
import './index.css';

// Kích hoạt cơ chế bảo vệ giao diện (chặn F12, chuột phải, phím tắt DevTools, kéo thả ảnh)
initSecurityGuard();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

