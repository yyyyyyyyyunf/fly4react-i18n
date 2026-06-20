import { useI18nContext } from './context.js';

export interface UseLocaleResult {
  locale: string;
  setLocale: (locale: string) => Promise<void>;
}

export function useLocale(): UseLocaleResult {
  const { locale, setLocale } = useI18nContext();
  return { locale, setLocale };
}
