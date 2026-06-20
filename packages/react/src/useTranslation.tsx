import { useCallback, Fragment } from 'react';
import { useI18nDataContext, useI18nApiContext, useI18nLoadingContext } from './context.js';
import { formatRich } from '@fly4react/i18n-core';
import type { Message, MessagesMap, RichTagHandler } from '@fly4react/i18n-core';
import type { ReactNode } from 'react';

declare global {
  interface Fly4ReactI18nMessages {}
  interface Fly4ReactI18nParams {}
}

export interface UseTranslationOptions {
  suspense?: boolean;
}

export type TranslationValues = Record<string, unknown>;

type ParamsFor<
  N extends string,
  K extends string,
  P = Fly4ReactI18nParams,
> = `${N}.${K}` extends keyof P ? P[`${N}.${K}`] : TranslationValues;

type ValidKey<N extends string, M = Fly4ReactI18nMessages> = N extends keyof M
  ? keyof M[N] & string
  : string;

export interface TypedTranslationFn<
  N extends string,
  M = Fly4ReactI18nMessages,
  P = Fly4ReactI18nParams,
> {
  <K extends ValidKey<N, M>>(key: K, values?: ParamsFor<N, K, P>): string;
  rich<K extends ValidKey<N, M>>(key: K, values?: TranslationValues): ReactNode;
  raw<K extends string>(key: K, values?: TranslationValues): string;
}

export interface UseTranslationResult<
  N extends string = string,
  M = Fly4ReactI18nMessages,
  P = Fly4ReactI18nParams,
> {
  t: TypedTranslationFn<N, M, P>;
  locale: string;
  isLoading: boolean;
  setLocale: (locale: string) => Promise<void>;
}

export function useTranslation<N extends ValidNamespace>(
  namespace: N,
  options?: UseTranslationOptions,
): UseTranslationResult<N>;
export function useTranslation(
  namespace: string,
  options?: UseTranslationOptions,
): UseTranslationResult<string>;
export function useTranslation(
  namespace: string,
  options: UseTranslationOptions = {},
): UseTranslationResult<string> {
  const { suspense = true } = options;
  const { i18n, locale } = useI18nDataContext();
  const { isLoading: checkLoading, loadNamespace, setLocale } = useI18nApiContext();
  // Subscribe to loading state so we re-render when the namespace finishes loading.
  useI18nLoadingContext();

  const loading = checkLoading(namespace);

  if (loading) {
    const promise = loadNamespace(namespace);
    if (suspense) {
      throw promise;
    }
  }

  const resolveMessage = useCallback(
    (key: string): Message | undefined => {
      return (
        i18n.getMessage(locale, namespace, key) ??
        i18n.getMessage(i18n.defaultLocale, namespace, key)
      );
    },
    [i18n, locale, namespace],
  );

  const formatString = useCallback(
    (message: Message, values?: TranslationValues) => {
      return i18n.format(locale, message, values);
    },
    [i18n, locale],
  );

  const t = useCallback(
    (key: string, values?: TranslationValues): string => {
      const message = resolveMessage(key);
      if (message === undefined) {
        return i18n.handleMissingKey({ key, namespace, locale });
      }
      return formatString(message, values);
    },
    [resolveMessage, formatString, i18n, locale, namespace],
  ) as TypedTranslationFn<string>;

  t.rich = useCallback(
    (key: string, values: TranslationValues = {}): ReactNode => {
      const message = resolveMessage(key);
      if (message === undefined) {
        return i18n.handleMissingKey({ key, namespace, locale });
      }

      if (typeof message !== 'string') {
        // Precompiled AST does not preserve rich tags; fall back to plain text
        return formatString(message, values);
      }

      const icuValues: TranslationValues = {};
      const tagHandlers: Record<string, RichTagHandler<ReactNode>> = {};

      for (const [k, v] of Object.entries(values)) {
        if (typeof v === 'function') {
          tagHandlers[k] = v as RichTagHandler<ReactNode>;
        } else {
          icuValues[k] = v;
        }
      }

      const richValues: Record<string, string | number | RichTagHandler<ReactNode>> = {
        ...(icuValues as Record<string, string | number>),
        ...tagHandlers,
      };

      const chunks = formatRich(message, richValues, (text) =>
        i18n.format(locale, text, icuValues),
      );

      return chunks.map((chunk, index) =>
        typeof chunk === 'string' ? chunk : <Fragment key={index}>{chunk as ReactNode}</Fragment>,
      );
    },
    [resolveMessage, formatString, i18n, locale, namespace],
  );

  t.raw = useCallback(
    (key: string, values?: TranslationValues): string => {
      const message = resolveMessage(key);
      if (message === undefined) {
        return i18n.handleMissingKey({ key, namespace, locale });
      }
      return formatString(message, values);
    },
    [resolveMessage, formatString, i18n, locale, namespace],
  );

  return {
    t,
    locale,
    isLoading: loading,
    setLocale,
  };
}

type ValidNamespace = keyof Fly4ReactI18nMessages & string;

export interface TypedI18nReact<M extends MessagesMap, P = Fly4ReactI18nParams> {
  useTranslation<N extends keyof M & string>(
    namespace: N,
    options?: UseTranslationOptions,
  ): UseTranslationResult<N, M, P>;
}

export function createTypedI18nReact<
  M extends MessagesMap,
  P = Fly4ReactI18nParams,
>(): TypedI18nReact<M, P> {
  return {
    useTranslation<N extends keyof M & string>(
      namespace: N,
      options?: UseTranslationOptions,
    ): UseTranslationResult<N, M, P> {
      return useTranslation(namespace as string, options) as UseTranslationResult<N, M, P>;
    },
  };
}
