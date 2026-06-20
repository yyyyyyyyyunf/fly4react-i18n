import { createI18n } from '@fly4react/i18n-core';
import { I18nProvider as I18nReactProvider, createTypedI18nReact } from '@fly4react/i18n-react';
import { messages } from './generated/i18n/messages.js';
import type { Messages, TranslationParams } from './generated/i18n/messages.js';

export const i18n = createI18n<Messages>({
  defaultLocale: 'en',
  locales: ['en', 'zh-CN'],
  messages,
  loader: async (locale, namespace) => {
    const mod = await import(`../locales/${locale}/${namespace}.json`);
    return mod.default;
  },
});

export const I18nProvider = I18nReactProvider;

export const { useTranslation } = createTypedI18nReact<Messages, TranslationParams>();
