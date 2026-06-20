import { createContext, useContext, useMemo } from 'react';
import type { I18nInstance, NamespaceMessages } from '@fly4react/i18n-core';

/** Data that changes when the active locale changes. */
export interface I18nDataContextValue {
  i18n: I18nInstance;
  locale: string;
}

/** Stable actions exposed by the provider. */
export interface I18nApiContextValue {
  setLocale: (locale: string) => Promise<void>;
  isLoading: (namespace: string) => boolean;
  getNamespace: (namespace: string) => NamespaceMessages | undefined;
  loadNamespace: (namespace: string) => Promise<void>;
}

/** Loading state that changes when namespaces finish loading. */
export interface I18nLoadingContextValue {
  loaded: ReadonlySet<string>;
}

/** Backward-compatible combined context value. */
export interface I18nReactContextValue extends I18nDataContextValue, I18nApiContextValue {}

export const I18nDataContext = createContext<I18nDataContextValue | null>(null);
export const I18nApiContext = createContext<I18nApiContextValue | null>(null);
export const I18nLoadingContext = createContext<I18nLoadingContextValue | null>(null);

/** @deprecated Use {@link I18nDataContext} and {@link I18nApiContext} instead. */
export const I18nContext = createContext<I18nReactContextValue | null>(null);

export function useI18nDataContext(): I18nDataContextValue {
  const context = useContext(I18nDataContext);
  if (!context) {
    throw new Error('useI18nDataContext must be used within an I18nProvider');
  }
  return context;
}

export function useI18nApiContext(): I18nApiContextValue {
  const context = useContext(I18nApiContext);
  if (!context) {
    throw new Error('useI18nApiContext must be used within an I18nProvider');
  }
  return context;
}

export function useI18nLoadingContext(): I18nLoadingContextValue {
  const context = useContext(I18nLoadingContext);
  if (!context) {
    throw new Error('useI18nLoadingContext must be used within an I18nProvider');
  }
  return context;
}

/** @deprecated Use {@link useI18nDataContext} and {@link useI18nApiContext} instead. */
export function useI18nContext(): I18nReactContextValue {
  const data = useI18nDataContext();
  const api = useI18nApiContext();
  // Subscribe to loading so legacy consumers re-render when namespaces load.
  useI18nLoadingContext();
  return useMemo(() => ({ ...data, ...api }), [data, api]);
}
