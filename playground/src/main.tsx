import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { i18n, I18nProvider } from './i18n.js';
import App from './App.js';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <I18nProvider i18n={i18n}>
        <App />
      </I18nProvider>
    </StrictMode>,
  );
}
