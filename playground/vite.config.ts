import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fly4reactI18n } from '@fly4react/i18n-vite';

export default defineConfig({
  plugins: [
    react(),
    fly4reactI18n({
      defaultLocale: 'en',
      localesDir: './locales',
      outputDir: './src/generated/i18n',
    }),
  ],
});
