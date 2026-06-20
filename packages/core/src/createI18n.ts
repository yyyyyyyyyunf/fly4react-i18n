import { formatMessage, formatMessageToParts } from './format.js';
import { MessageStore } from './store.js';
import { resolveLocale } from './detect.js';
import type {
  I18nConfig,
  I18nInstance,
  Message,
  MessagePart,
  MessagesMap,
  MissingKeyHandler,
} from './types.js';

export function createI18n<TMessages extends MessagesMap = MessagesMap>(
  config: I18nConfig<TMessages>,
): I18nInstance<TMessages> {
  const defaultMessages = (config.messages ?? {}) as TMessages;
  const supportedLocales = config.locales ?? [config.defaultLocale];
  const store = new MessageStore(config.defaultLocale, defaultMessages, config.loader);

  const missingKeyHandler = createMissingKeyHandler(config.missingKey);

  const instance: I18nInstance<TMessages> = {
    config,
    defaultLocale: config.defaultLocale,
    locales: supportedLocales,

    resolveLocale(context = {}) {
      return resolveLocale(config.localeDetector, context, supportedLocales, config.defaultLocale);
    },

    hasNamespace(locale, namespace) {
      return store.has(locale, namespace);
    },

    loadNamespace(locale, namespace) {
      return store.load(locale, namespace);
    },

    getNamespace(locale, namespace) {
      return store.get(locale, namespace);
    },

    getMessage(locale, namespace, key) {
      const messages = store.get(locale, namespace);
      if (messages && key in messages) {
        return messages[key];
      }

      if (locale !== config.defaultLocale) {
        const fallback = store.get(config.defaultLocale, namespace);
        if (fallback && key in fallback) {
          return fallback[key];
        }
      }

      return undefined;
    },

    format(locale, message, values) {
      return formatMessage(message, values, locale, config.formatters);
    },

    formatToParts(locale, message, values) {
      return formatMessageToParts(message, values, locale, config.formatters);
    },

    handleMissingKey({ key, namespace, locale }) {
      return (
        missingKeyHandler({
          key,
          namespace,
          locale,
          defaultLocale: config.defaultLocale,
        }) ?? formatKey({ key, namespace })
      );
    },
  };

  return instance;
}

function createMissingKeyHandler(missingKey: I18nConfig['missingKey']): MissingKeyHandler {
  if (missingKey === 'throw') {
    return ({ key, namespace, locale }) => {
      throw new Error(`Missing translation key "${namespace}.${key}" for locale "${locale}"`);
    };
  }

  if (typeof missingKey === 'function') {
    return (info) => missingKey(info) ?? formatKey(info);
  }

  return ({ key, namespace }) => `${namespace}.${key}`;
}

function formatKey({ namespace, key }: { namespace: string; key: string }): string {
  return `${namespace}.${key}`;
}

export type { I18nConfig, I18nInstance, Message, MessagePart, MessagesMap };
