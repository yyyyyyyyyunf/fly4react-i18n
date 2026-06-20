import type { DetectorContext, LocaleDetector } from './types.js';

export function normalizeLocale(locale: string): string {
  return locale.replace(/_/g, '-').toLowerCase();
}

export function resolveLocale(
  detectors: LocaleDetector | LocaleDetector[] | undefined,
  context: DetectorContext,
  supportedLocales: string[],
  defaultLocale: string,
): string {
  if (!detectors) {
    return defaultLocale;
  }

  const list = Array.isArray(detectors) ? detectors : [detectors];
  const supported = new Set(supportedLocales.map(normalizeLocale));

  for (const detector of list) {
    const detected = detector(context);
    if (!detected) continue;

    const normalized = normalizeLocale(detected);

    if (supported.has(normalized)) {
      return detected;
    }

    // Try language-only match (e.g. 'zh-CN' -> 'zh')
    const languageOnly = normalized.split('-')[0];
    const match = supportedLocales.find(
      (locale) => normalizeLocale(locale).split('-')[0] === languageOnly,
    );
    if (match) {
      return match;
    }
  }

  return defaultLocale;
}

export function urlDetector(): LocaleDetector {
  return (context) => {
    const url = context.url;
    if (!url) return null;

    let pathname: string;
    try {
      pathname = typeof url === 'string' ? new URL(url).pathname : url.pathname;
    } catch {
      pathname = typeof url === 'string' ? url : url.pathname;
    }

    const segment = pathname.split('/')[1];
    if (!segment) return null;

    return segment;
  };
}

export function cookieDetector(name = 'locale'): LocaleDetector {
  return (context) => {
    const cookie = context.headers?.cookie;
    if (typeof cookie !== 'string') return null;

    const match = cookie.match(new RegExp(`(?:^|;)\\s*${name}=([^;]+)`));
    return match?.[1] ?? null;
  };
}

export function storageDetector(key = 'locale'): LocaleDetector {
  return (context) => {
    try {
      return context.storage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  };
}

export function navigatorDetector(): LocaleDetector {
  return (context) => {
    const navigator = context.navigator;
    if (!navigator) return null;

    const languages = navigator.languages ?? [];
    for (const locale of languages) {
      if (locale) return locale;
    }

    return navigator.language ?? null;
  };
}
