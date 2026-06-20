import IntlMessageFormat from 'intl-messageformat';
import { parseMessage } from './parse.js';
import type { Formatter, Message, MessagePart } from './types.js';

export function formatMessage(
  message: Message,
  values: Record<string, unknown> | undefined,
  locale: string,
  formatters?: Record<string, Formatter>,
): string {
  const ast = parseMessage(message);
  const imf = new IntlMessageFormat(ast, locale, formatters);
  return imf.format(values) as string;
}

export function formatMessageToParts(
  message: Message,
  values: Record<string, unknown> | undefined,
  locale: string,
  formatters?: Record<string, Formatter>,
): MessagePart[] {
  const ast = parseMessage(message);
  const imf = new IntlMessageFormat(ast, locale, formatters);
  const parts = imf.formatToParts(values) as unknown as Array<{
    type: string;
    value: unknown;
  }>;
  return parts.map((part) => ({
    type: part.type === 'argument' ? 'argument' : 'text',
    value: part.value,
  }));
}
