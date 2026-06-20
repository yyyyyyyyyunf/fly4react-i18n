# @fly4react/i18n-core

Runtime core for `@fly4react/i18n`.

## Installation

```bash
pnpm add @fly4react/i18n-core
```

## Usage

```ts
import { createI18n } from '@fly4react/i18n-core';

const i18n = createI18n({
  defaultLocale: 'en',
  locales: ['en', 'zh-CN'],
  messages: {
    common: {
      hello: 'Hello {name}',
    },
  },
  loader: async (locale, namespace) => {
    const mod = await import(`./locales/${locale}/${namespace}.json`);
    return mod.default;
  },
});
```

## API

- `createI18n(config)` — create an i18n instance
- `formatMessage(message, values, locale)` — format an ICU message
- `formatRich(message, values, formatText)` — format a rich-text message
- `urlDetector`, `cookieDetector`, `storageDetector`, `navigatorDetector` — locale detectors
- `cookiePersistence`, `storagePersistence` — locale persistence helpers
