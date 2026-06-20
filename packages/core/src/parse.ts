import { parse, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';
import type { Message } from './types.js';

export function parseMessage(message: Message): MessageFormatElement[] {
  if (typeof message === 'string') {
    return parse(message);
  }
  return message;
}

export function isMessage(value: unknown): value is Message {
  return typeof value === 'string' || Array.isArray(value);
}
