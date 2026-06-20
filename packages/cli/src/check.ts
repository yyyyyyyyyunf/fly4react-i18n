/* eslint-disable no-console */
import { readdir } from 'node:fs/promises';
import pc from 'picocolors';
import { loadConfig, findNamespaces, readNamespaceMessages, flattenKeys } from './utils.js';
import type { CliConfig } from './types.js';

export async function check(cwd: string, config?: Partial<CliConfig>): Promise<boolean> {
  const resolved = { ...(await loadConfig(cwd)), ...config };
  const { defaultLocale, localesDir } = resolved;

  const namespaces = await findNamespaces(localesDir, defaultLocale);
  let hasErrors = false;

  for (const namespace of namespaces) {
    const defaultMessages = await readNamespaceMessages(localesDir, defaultLocale, namespace);
    const defaultKeys = new Set(flattenKeys(defaultMessages));

    const locales = await findLocales(localesDir);
    for (const locale of locales) {
      if (locale === defaultLocale) continue;

      const messages = await readNamespaceMessages(localesDir, locale, namespace);
      const keys = new Set(flattenKeys(messages));

      for (const key of defaultKeys) {
        if (!keys.has(key)) {
          console.error(
            pc.red(`Missing key: ${pc.bold(`${namespace}.${key}`)} in locale ${pc.bold(locale)}`),
          );
          hasErrors = true;
        }
      }

      for (const key of keys) {
        if (!defaultKeys.has(key)) {
          console.warn(
            pc.yellow(`Extra key: ${pc.bold(`${namespace}.${key}`)} in locale ${pc.bold(locale)}`),
          );
        }
      }
    }
  }

  if (hasErrors) {
    console.error(pc.red('\nLocale check failed.'));
    return false;
  }

  console.log(pc.green('\nAll locales are complete.'));
  return true;
}

async function findLocales(localesDir: string): Promise<string[]> {
  const entries = await readdir(localesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}
