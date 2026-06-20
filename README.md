:warning: This is the new implementation of `react-native-localize-ext`. The old repository has been archived.

# @fly4react/i18n

A modern, type-safe, ICU-based internationalization library for React.

## Features

- **Type-safe translation keys** via codegen from your default locale JSON files
- **ICU MessageFormat** support for interpolation, pluralization, select, and formatting
- **React 19 first-class** hooks with Suspense integration
- **SSR / RSC** support via a dedicated server entry
- **Namespace-based** message organization with on-demand loading
- **Rich text** translations with tag handlers
- **Development toolchain** for codegen, locale completeness checks, and Vite integration

## Packages

| Package                  | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `@fly4react/i18n-core`   | Runtime core: ICU formatting, locale loading, detectors, persistence |
| `@fly4react/i18n-react`  | React hooks and components                                           |
| `@fly4react/i18n-server` | SSR / RSC APIs                                                       |
| `@fly4react/i18n-cli`    | Codegen and locale checks                                            |
| `@fly4react/i18n-vite`   | Vite plugin                                                          |
| `@fly4react/i18n-oxlint` | Source-level key validation utilities                                |

## Quick Start

```bash
pnpm add @fly4react/i18n-core @fly4react/i18n-react
pnpm add -D @fly4react/i18n-cli @fly4react/i18n-vite
```

Create your locale files:

```json
// locales/en/common.json
{
  "greeting": "Hello, {name}!",
  "counter": "You have {count, plural, one {# message} other {# messages}}."
}
```

Add a config file:

```js
// fly4react-i18n.config.js
export default {
  defaultLocale: 'en',
  localesDir: './locales',
  outputDir: './src/generated/i18n',
};
```

Generate types and precompiled messages:

```bash
npx fly4react-i18n generate
```

Use in your React app:

```tsx
import { createI18n } from '@fly4react/i18n-core';
import { I18nProvider, useTranslation } from '@fly4react/i18n-react';
import { messages } from './generated/i18n/messages.js';

const i18n = createI18n({
  defaultLocale: 'en',
  locales: ['en', 'zh-CN'],
  messages,
  loader: async (locale, namespace) => {
    const mod = await import(`../locales/${locale}/${namespace}.json`);
    return mod.default;
  },
});

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <Greeting />
    </I18nProvider>
  );
}

function Greeting() {
  const { t } = useTranslation('common');
  return (
    <div>
      <h1>{t('greeting', { name: 'World' })}</h1>
      <p>{t('counter', { count: 5 })}</p>
    </div>
  );
}
```

## Playground

See the `playground/` directory for a working Vite + React example.

## Migration from `react-native-localize-ext`

See [MIGRATION.md](./MIGRATION.md).

## License

MIT
