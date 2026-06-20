import { describe, it, expect, vi } from 'vitest';
import { createI18n } from '@fly4react/i18n-core';
import { getTranslations } from './getTranslations.js';

describe('getTranslations', () => {
  it('returns translated messages for a locale', async () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      locales: ['en', 'zh-CN'],
      messages: {
        common: {
          hello: 'Hello {name}',
        },
      },
      loader: vi.fn(async (locale) => {
        if (locale === 'zh-CN') {
          return { hello: '你好 {name}' };
        }
        return undefined;
      }),
    });

    const t = await getTranslations(i18n, 'zh-CN', 'common');
    expect(t('hello', { name: 'World' })).toBe('你好 World');
  });

  it('falls back to default locale', async () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      messages: {
        common: {
          hello: 'Hello {name}',
        },
      },
    });

    const t = await getTranslations(i18n, 'fr', 'common');
    expect(t('hello', { name: 'World' })).toBe('Hello World');
  });
});
