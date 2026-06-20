import { useI18nDataContext, useI18nApiContext } from './context.js';

export interface UseLocaleResult {
  locale: string;
  setLocale: (locale: string) => Promise<void>;
}

export function useLocale(): UseLocaleResult {
  const { locale } = useI18nDataContext();
  const { setLocale } = useI18nApiContext();
  return { locale, setLocale };
}
