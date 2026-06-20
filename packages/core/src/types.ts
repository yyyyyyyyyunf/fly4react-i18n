import type { MessageFormatElement } from '@formatjs/icu-messageformat-parser';

export type Message = string | MessageFormatElement[];

export type NamespaceMessages = Record<string, Message>;

export type MessagesMap = Record<string, NamespaceMessages>;

export type LocaleLoader = (
  locale: string,
  namespace: string,
) => Promise<NamespaceMessages | undefined> | NamespaceMessages | undefined;

export type Formatter = (value: unknown, locale: string, arg?: string) => unknown;

export interface DetectorContext {
  url?: string | URL;
  headers?: Record<string, string | string[] | undefined>;
  storage?: Storage;
  navigator?: {
    language?: string;
    languages?: readonly string[];
  };
}

export type LocaleDetector = (context: DetectorContext) => string | undefined | null;

export interface LocalePersistence {
  get(context: DetectorContext): string | undefined | null;
  set(locale: string, context: DetectorContext): void;
}

export type MissingKeyHandler = (info: {
  key: string;
  namespace: string;
  locale: string;
  defaultLocale: string;
}) => string | undefined;

export interface I18nConfig<TMessages extends MessagesMap = MessagesMap> {
  defaultLocale: string;
  locales?: string[];
  messages?: TMessages;
  loader?: LocaleLoader;
  localeDetector?: LocaleDetector | LocaleDetector[];
  persistence?: LocalePersistence;
  missingKey?: MissingKeyHandler | 'returnKey' | 'throw';
  formatters?: Record<string, Formatter>;
}

export interface I18nInstance<TMessages extends MessagesMap = MessagesMap> {
  readonly config: I18nConfig<TMessages>;
  readonly defaultLocale: string;
  readonly locales: string[];
  resolveLocale(context?: DetectorContext): string;
  hasNamespace(locale: string, namespace: keyof TMessages & string): boolean;
  loadNamespace(locale: string, namespace: keyof TMessages & string): Promise<void>;
  getNamespace(locale: string, namespace: keyof TMessages & string): NamespaceMessages | undefined;
  getMessage(locale: string, namespace: keyof TMessages & string, key: string): Message | undefined;
  format(locale: string, message: Message, values?: Record<string, unknown>): string;
  formatToParts(locale: string, message: Message, values?: Record<string, unknown>): MessagePart[];
  handleMissingKey(info: { key: string; namespace: string; locale: string }): string;
}

export interface MessagePart {
  type: 'text' | 'argument';
  value: unknown;
}
