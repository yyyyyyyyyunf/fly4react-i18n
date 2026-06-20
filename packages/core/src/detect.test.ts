import { describe, it, expect } from 'vitest';
import {
  urlDetector,
  cookieDetector,
  storageDetector,
  navigatorDetector,
  resolveLocale,
} from './detect.js';

describe('locale detectors', () => {
  it('detects from URL pathname', () => {
    const detector = urlDetector();
    expect(detector({ url: new URL('https://example.com/zh-CN/page') })).toBe('zh-CN');
    expect(detector({ url: 'https://example.com/en/page' })).toBe('en');
    expect(detector({ url: new URL('https://example.com/') })).toBeNull();
  });

  it('detects from cookie', () => {
    const detector = cookieDetector('locale');
    expect(detector({ headers: { cookie: 'locale=zh-CN; other=value' } })).toBe('zh-CN');
    expect(detector({ headers: { cookie: 'other=value' } })).toBeNull();
  });

  it('detects from storage', () => {
    const detector = storageDetector('locale');
    const storage = { getItem: () => 'zh-CN' } as unknown as Storage;
    expect(detector({ storage })).toBe('zh-CN');
  });

  it('detects from navigator', () => {
    const detector = navigatorDetector();
    expect(detector({ navigator: { language: 'zh-CN', languages: ['zh-CN', 'en'] } })).toBe(
      'zh-CN',
    );
    expect(detector({ navigator: { language: 'en-US' } })).toBe('en-US');
  });
});

describe('resolveLocale', () => {
  it('returns first supported detected locale', () => {
    const locale = resolveLocale(
      [urlDetector(), cookieDetector()],
      { url: new URL('https://example.com/fr/page'), headers: { cookie: 'locale=zh-CN' } },
      ['en', 'zh-CN'],
      'en',
    );
    expect(locale).toBe('zh-CN');
  });

  it('falls back to language-only match', () => {
    const locale = resolveLocale(
      navigatorDetector(),
      { navigator: { language: 'zh-TW' } },
      ['en', 'zh-CN'],
      'en',
    );
    expect(locale).toBe('zh-CN');
  });

  it('falls back to default when nothing matches', () => {
    const locale = resolveLocale(
      navigatorDetector(),
      { navigator: { language: 'fr' } },
      ['en', 'zh-CN'],
      'en',
    );
    expect(locale).toBe('en');
  });
});
