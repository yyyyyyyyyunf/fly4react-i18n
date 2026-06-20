import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { useTranslation, useLocale } from '@fly4react/i18n-react';

function Greeting() {
  const { t } = useTranslation('common');
  const { locale, setLocale } = useLocale();

  return (
    <div>
      <h1>{t('greeting', { name: 'World' })}</h1>
      <p>{t('counter', { count: 5 })}</p>
      <p>
        {t.rich('tos', {
          link: (chunks: ReactNode[]) => <a href="/tos">{chunks}</a>,
        })}
      </p>
      <button
        onClick={() => {
          const next = locale === 'en' ? 'zh-CN' : 'en';
          void setLocale(next);
        }}
      >
        {t('switchLanguage', { locale: locale === 'en' ? '中文' : 'English' })}
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div>Loading translations...</div>}>
      <Greeting />
    </Suspense>
  );
}
