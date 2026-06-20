import IntlMessageFormat from 'intl-messageformat';
import { parseMessage } from './parse.js';
import type { Formatter, Message, MessagePart } from './types.js';

const NO_FORMATTERS = Object.freeze({});

const formatterCache = new Map<string, WeakMap<object, IntlMessageFormat>>();

function getCacheKey(message: Message, locale: string): string {
  const messageKey = typeof message === 'string' ? message : JSON.stringify(message);
  return `${locale}\u0000${messageKey}`;
}

function getFormatter(
  message: Message,
  locale: string,
  formatters: Record<string, Formatter> | undefined,
): IntlMessageFormat {
  const cacheKey = getCacheKey(message, locale);
  const formattersKey = formatters ?? NO_FORMATTERS;

  let formattersMap = formatterCache.get(cacheKey);
  if (!formattersMap) {
    formattersMap = new WeakMap();
    formatterCache.set(cacheKey, formattersMap);
  }

  let imf = formattersMap.get(formattersKey);
  if (!imf) {
    const ast = parseMessage(message);
    imf = new IntlMessageFormat(ast, locale, formatters);
    formattersMap.set(formattersKey, imf);
  }

  return imf;
}

export function formatMessage(
  message: Message,
  values: Record<string, unknown> | undefined,
  locale: string,
  formatters?: Record<string, Formatter>,
): string {
  const imf = getFormatter(message, locale, formatters);
  return imf.format(values) as string;
}

export function formatMessageToParts(
  message: Message,
  values: Record<string, unknown> | undefined,
  locale: string,
  formatters?: Record<string, Formatter>,
): MessagePart[] {
  const imf = getFormatter(message, locale, formatters);
  const parts = imf.formatToParts(values) as unknown as Array<{
    type: string;
    value: unknown;
  }>;
  return parts.map((part) => ({
    type: part.type === 'argument' ? 'argument' : 'text',
    value: part.value,
  }));
}
