import { createContext, useContext } from 'react';
import type { I18nInstance, NamespaceMessages } from '@fly4react/i18n-core';

export interface I18nReactContextValue {
  i18n: I18nInstance;
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  isLoading: (namespace: string) => boolean;
  getNamespace: (namespace: string) => NamespaceMessages | undefined;
  loadNamespace: (namespace: string) => Promise<void>;
}

export const I18nContext = createContext<I18nReactContextValue | null>(null);

export function useI18nContext(): I18nReactContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
