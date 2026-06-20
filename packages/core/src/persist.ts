import type { LocalePersistence } from './types.js';

export function cookiePersistence(
  options: {
    key?: string;
    path?: string;
    maxAge?: number;
    sameSite?: 'strict' | 'lax' | 'none';
    secure?: boolean;
  } = {},
): LocalePersistence {
  const { key = 'locale', path = '/', maxAge = 60 * 60 * 24 * 365, sameSite = 'lax' } = options;

  return {
    get(context) {
      const cookie = context.headers?.cookie;
      if (typeof cookie !== 'string') return null;

      const match = cookie.match(new RegExp(`(?:^|;)\\s*${key}=([^;]+)`));
      return match?.[1] ?? null;
    },
    set(locale, _context) {
      if (typeof document === 'undefined') return;

      let cookie = `${key}=${locale};path=${path};max-age=${maxAge};samesite=${sameSite}`;
      if (options.secure) {
        cookie += ';secure';
      }
      // eslint-disable-next-line unicorn/no-document-cookie
      document.cookie = cookie;
    },
  };
}

export function storagePersistence(key = 'locale'): LocalePersistence {
  return {
    get(context) {
      try {
        return context.storage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    set(locale, context) {
      try {
        context.storage?.setItem(key, locale);
      } catch {
        // ignore
      }
    },
  };
}
