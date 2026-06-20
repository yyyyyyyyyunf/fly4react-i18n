import { formatRich } from '@fly4react/i18n-core';
import type { I18nInstance, Message, RichTagHandler } from '@fly4react/i18n-core';

export type ServerTranslationValues = Record<string, unknown>;

export interface ServerTranslationFn {
  (key: string, values?: ServerTranslationValues): string;
  rich: (key: string, values?: ServerTranslationValues) => (string | unknown)[];
}

export async function getTranslations(
  i18n: I18nInstance,
  locale: string,
  namespace: string,
): Promise<ServerTranslationFn> {
  await i18n.loadNamespace(locale, namespace);

  const resolveMessage = (key: string): Message | undefined => {
    return (
      i18n.getMessage(locale, namespace, key) ?? i18n.getMessage(i18n.defaultLocale, namespace, key)
    );
  };

  const t = ((key: string, values?: ServerTranslationValues): string => {
    const message = resolveMessage(key);
    if (message === undefined) {
      return i18n.handleMissingKey({ key, namespace, locale });
    }
    return i18n.format(locale, message, values);
  }) as ServerTranslationFn;

  t.rich = (key: string, values: ServerTranslationValues = {}): (string | unknown)[] => {
    const message = resolveMessage(key);
    if (message === undefined) {
      return [i18n.handleMissingKey({ key, namespace, locale })];
    }

    if (typeof message !== 'string') {
      return [i18n.format(locale, message, values)];
    }

    const icuValues: ServerTranslationValues = {};
    const tagHandlers: Record<string, RichTagHandler<unknown>> = {};

    for (const [k, v] of Object.entries(values)) {
      if (typeof v === 'function') {
        tagHandlers[k] = v as RichTagHandler<unknown>;
      } else {
        icuValues[k] = v;
      }
    }

    return formatRich(
      message,
      { ...(icuValues as Record<string, string | number>), ...tagHandlers },
      (text) => i18n.format(locale, text, icuValues),
    );
  };

  return t;
}
