# @fly4react/i18n-react

React bindings for `@fly4react/i18n`.

## Installation

```bash
pnpm add @fly4react/i18n-react
```

## Usage

```tsx
import { I18nProvider, useTranslation, useLocale } from '@fly4react/i18n-react';

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <Greeting />
    </I18nProvider>
  );
}

function Greeting() {
  const { t } = useTranslation('common');
  const { locale, setLocale } = useLocale();

  return (
    <div>
      <h1>{t('hello', { name: 'World' })}</h1>
      <button onClick={() => setLocale(locale === 'en' ? 'zh-CN' : 'en')}>Switch language</button>
    </div>
  );
}
```

## API

- `<I18nProvider i18n={i18n}>` — React context provider
- `useTranslation(namespace, options?)` — returns `{ t, locale, isLoading, setLocale }`
- `useLocale()` — returns `{ locale, setLocale }`
- `<Trans i18nKey="..." />` — component for rich-text translations
