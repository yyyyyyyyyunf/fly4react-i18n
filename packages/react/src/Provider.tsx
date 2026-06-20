import { useState, useCallback, useRef, useMemo } from 'react';
import { I18nContext } from './context.js';
import type { I18nInstance, NamespaceMessages } from '@fly4react/i18n-core';
import type { ReactNode } from 'react';

export interface I18nProviderProps {
  i18n: I18nInstance;
  locale?: string;
  children: ReactNode;
}

export function I18nProvider({ i18n, locale: initialLocale, children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState(() => initialLocale ?? i18n.defaultLocale);
  const [loaded, setLoaded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const namespace of Object.keys(i18n.config.messages ?? {})) {
      if (i18n.hasNamespace(locale, namespace)) {
        initial.add(cacheKey(locale, namespace));
      }
      // Default locale namespaces are always available as fallback
      if (locale !== i18n.defaultLocale && i18n.hasNamespace(i18n.defaultLocale, namespace)) {
        initial.add(cacheKey(i18n.defaultLocale, namespace));
      }
    }
    return initial;
  });
  const loading = useRef<Map<string, Promise<void>>>(new Map());

  const isLoading = useCallback(
    (namespace: string) => {
      return !loaded.has(cacheKey(locale, namespace));
    },
    [loaded, locale],
  );

  const getNamespace = useCallback(
    (namespace: string): NamespaceMessages | undefined => {
      if (loaded.has(cacheKey(locale, namespace))) {
        return i18n.getNamespace(locale, namespace);
      }
      if (loaded.has(cacheKey(i18n.defaultLocale, namespace))) {
        return i18n.getNamespace(i18n.defaultLocale, namespace);
      }
      return undefined;
    },
    [i18n, loaded, locale],
  );

  const loadNamespace = useCallback(
    async (namespace: string): Promise<void> => {
      const key = cacheKey(locale, namespace);
      if (loaded.has(key)) return;

      const existing = loading.current.get(key);
      if (existing) {
        await existing;
        return;
      }

      const promise = i18n.loadNamespace(locale, namespace).then(() => {
        setLoaded((prev) => new Set([...prev, key]));
      });

      loading.current.set(key, promise);
      await promise;
    },
    [i18n, loaded, locale],
  );

  const setLocale = useCallback(
    async (newLocale: string) => {
      if (newLocale === locale) return;

      i18n.config.persistence?.set(newLocale, createClientContext());
      setLocaleState(newLocale);

      const namespaces = Object.keys(i18n.config.messages ?? {});
      await Promise.all(
        namespaces.map((namespace) =>
          i18n.loadNamespace(newLocale, namespace).then(() => {
            setLoaded((prev) => new Set([...prev, cacheKey(newLocale, namespace)]));
          }),
        ),
      );
    },
    [i18n, locale],
  );

  const value = useMemo(
    () => ({
      i18n,
      locale,
      setLocale,
      isLoading,
      getNamespace,
      loadNamespace,
    }),
    [i18n, locale, setLocale, isLoading, getNamespace, loadNamespace],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function cacheKey(locale: string, namespace: string): string {
  return `${locale}:${namespace}`;
}

function createClientContext() {
  return {
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    navigator: typeof navigator !== 'undefined' ? navigator : undefined,
  };
}
