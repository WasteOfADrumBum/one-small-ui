import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, ToastProvider } from 'onesmallui';
import 'onesmallui/scss';
import './site/site.scss';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider placement="bottom-right">
        <App />
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
