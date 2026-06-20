import { useState, useCallback, useRef, useMemo } from 'react';
import { I18nContext, I18nDataContext, I18nApiContext, I18nLoadingContext } from './context.js';
import { useLatestValueRef } from './hooks/useLatestValueRef.js';
import type { I18nInstance, NamespaceMessages } from '@fly4react/i18n-core';
import type { ReactNode } from 'react';

export interface I18nProviderProps {
  i18n: I18nInstance;
  locale?: string;
  children: ReactNode;
}

export function I18nProvider({
  i18n: i18nProp,
  locale: initialLocale,
  children,
}: I18nProviderProps) {
  // Guard against an unstable i18n prop by pinning the first received instance.
  const i18nRef = useRef(i18nProp);
  const i18n = i18nRef.current;

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

  const localeRef = useLatestValueRef(locale);
  const loadedRef = useLatestValueRef(loaded);

  const isLoading = useCallback((namespace: string) => {
    return !loadedRef.current.has(cacheKey(localeRef.current, namespace));
  }, []);

  const getNamespace = useCallback(
    (namespace: string): NamespaceMessages | undefined => {
      const currentLocale = localeRef.current;
      if (loadedRef.current.has(cacheKey(currentLocale, namespace))) {
        return i18n.getNamespace(currentLocale, namespace);
      }
      if (loadedRef.current.has(cacheKey(i18n.defaultLocale, namespace))) {
        return i18n.getNamespace(i18n.defaultLocale, namespace);
      }
      return undefined;
    },
    [i18n],
  );

  const loadNamespace = useCallback(
    async (namespace: string): Promise<void> => {
      const key = cacheKey(localeRef.current, namespace);
      if (loadedRef.current.has(key)) return;

      const existing = loading.current.get(key);
      if (existing) {
        await existing;
        return;
      }

      const promise = i18n
        .loadNamespace(localeRef.current, namespace)
        .then(() => {
          setLoaded((prev) => new Set([...prev, key]));
        })
        .finally(() => {
          loading.current.delete(key);
        });

      loading.current.set(key, promise);
      await promise;
    },
    [i18n],
  );

  const setLocale = useCallback(
    async (newLocale: string) => {
      if (newLocale === localeRef.current) return;

      const namespaces = Object.keys(i18n.config.messages ?? {});
      await Promise.all(
        namespaces.map((namespace) =>
          i18n.loadNamespace(newLocale, namespace).then(() => {
            setLoaded((prev) => new Set([...prev, cacheKey(newLocale, namespace)]));
          }),
        ),
      );

      // Ignore stale results if another setLocale raced ahead.
      if (newLocale === localeRef.current) {
        i18n.config.persistence?.set(newLocale, createClientContext());
        setLocaleState(newLocale);
      }
    },
    [i18n],
  );

  const dataValue = useMemo(
    () => ({
      i18n,
      locale,
    }),
    [i18n, locale],
  );

  const apiValue = useMemo(
    () => ({
      setLocale,
      isLoading,
      getNamespace,
      loadNamespace,
    }),
    [setLocale, isLoading, getNamespace, loadNamespace],
  );

  const loadingValue = useMemo(
    () => ({
      loaded,
    }),
    [loaded],
  );

  const legacyValue = useMemo(
    () => ({
      ...dataValue,
      ...apiValue,
    }),
    [dataValue, apiValue],
  );

  return (
    <I18nDataContext.Provider value={dataValue}>
      <I18nLoadingContext.Provider value={loadingValue}>
        <I18nApiContext.Provider value={apiValue}>
          <I18nContext.Provider value={legacyValue}>{children}</I18nContext.Provider>
        </I18nApiContext.Provider>
      </I18nLoadingContext.Provider>
    </I18nDataContext.Provider>
  );
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
