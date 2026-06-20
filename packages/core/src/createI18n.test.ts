import { describe, it, expect, vi } from 'vitest';
import { createI18n } from './createI18n.js';

describe('createI18n', () => {
  const config = {
    defaultLocale: 'en',
    locales: ['en', 'zh-CN'] as const,
    messages: {
      common: {
        hello: 'Hello {name}',
        count: 'You have {count, plural, one {# item} other {# items}}',
      },
    },
  };

  it('creates an instance with default locale', () => {
    const i18n = createI18n(config);
    expect(i18n.defaultLocale).toBe('en');
    expect(i18n.locales).toEqual(['en', 'zh-CN']);
  });

  it('formats a simple message', () => {
    const i18n = createI18n(config);
    const message = i18n.getMessage('en', 'common', 'hello');
    expect(message).toBe('Hello {name}');
    expect(i18n.format('en', message!, { name: 'World' })).toBe('Hello World');
  });

  it('formats plural messages', () => {
    const i18n = createI18n(config);
    const message = i18n.getMessage('en', 'common', 'count')!;
    expect(i18n.format('en', message, { count: 1 })).toBe('You have 1 item');
    expect(i18n.format('en', message, { count: 5 })).toBe('You have 5 items');
  });

  it('falls back to default locale for missing keys', () => {
    const i18n = createI18n(config);
    expect(i18n.getMessage('zh-CN', 'common', 'hello')).toBe('Hello {name}');
  });

  it('loads namespaces via loader', async () => {
    const loader = vi.fn(async (locale: string) => {
      if (locale === 'zh-CN') {
        return { hello: '你好 {name}' };
      }
      return undefined;
    });

    const i18n = createI18n({
      ...config,
      loader,
    });

    await i18n.loadNamespace('zh-CN', 'common');
    expect(loader).toHaveBeenCalledWith('zh-CN', 'common');

    const message = i18n.getMessage('zh-CN', 'common', 'hello')!;
    expect(i18n.format('zh-CN', message, { name: 'World' })).toBe('你好 World');
  });

  it('returns key for missing keys by default', () => {
    const i18n = createI18n(config);
    expect(i18n.handleMissingKey({ key: 'missing', namespace: 'common', locale: 'en' })).toBe(
      'common.missing',
    );
  });

  it('throws for missing keys when configured', () => {
    const i18n = createI18n({ ...config, missingKey: 'throw' });
    expect(() =>
      i18n.handleMissingKey({ key: 'missing', namespace: 'common', locale: 'en' }),
    ).toThrow('Missing translation key "common.missing" for locale "en"');
  });

  it('uses custom missing key handler', () => {
    const i18n = createI18n({
      ...config,
      missingKey: ({ key, namespace }) => `[${namespace}.${key}]`,
    });
    expect(i18n.handleMissingKey({ key: 'missing', namespace: 'common', locale: 'en' })).toBe(
      '[common.missing]',
    );
  });
});
