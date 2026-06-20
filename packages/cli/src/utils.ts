import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, extname, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { CliConfig } from './types.js';

export async function loadConfig(cwd: string): Promise<CliConfig> {
  const configPath = join(cwd, 'fly4react-i18n.config.js');
  try {
    await stat(configPath);
    const module = await import(pathToFileURL(configPath).href);
    return module.default ?? module;
  } catch {
    // fallthrough
  }

  const pkgPath = join(cwd, 'package.json');
  try {
    const pkg = JSON.parse(await readFile(pkgPath, 'utf-8')) as {
      'fly4react-i18n'?: CliConfig;
    };
    if (pkg['fly4react-i18n']) {
      return pkg['fly4react-i18n'];
    }
  } catch {
    // fallthrough
  }

  return {
    defaultLocale: 'en',
    localesDir: join(cwd, 'locales'),
    outputDir: join(cwd, 'src', 'generated', 'i18n'),
  };
}

export async function readJsonFile<T = unknown>(path: string): Promise<T> {
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content) as T;
}

export async function findNamespaces(localesDir: string, locale: string): Promise<string[]> {
  const localeDir = join(localesDir, locale);
  const entries = await readdir(localeDir, { withFileTypes: true });
  const namespaces: string[] = [];

  for (const entry of entries) {
    if (entry.isFile() && extname(entry.name) === '.json') {
      namespaces.push(entry.name.replace(/\.json$/, ''));
    } else if (entry.isDirectory()) {
      namespaces.push(entry.name);
    }
  }

  return namespaces.sort();
}

export async function readNamespaceMessages(
  localesDir: string,
  locale: string,
  namespace: string,
): Promise<Record<string, string>> {
  const filePath = join(localesDir, locale, `${namespace}.json`);
  const dirPath = join(localesDir, locale, namespace);

  try {
    return await readJsonFile<Record<string, string>>(filePath);
  } catch {
    // Try directory index
    try {
      return await readJsonFile<Record<string, string>>(join(dirPath, 'index.json'));
    } catch {
      return {};
    }
  }
}

export function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

export function relativePath(from: string, to: string): string {
  const rel = relative(from, to);
  return rel.startsWith('.') ? rel : `./${rel}`;
}

export async function ensureDir(path: string): Promise<void> {
  const { mkdir } = await import('node:fs/promises');
  await mkdir(path, { recursive: true });
}

export { join, dirname };
