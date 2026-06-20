import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import {
  loadConfig,
  findNamespaces,
  readNamespaceMessages,
  flattenKeys,
} from '@fly4react/i18n-cli';

export interface LintResult {
  file: string;
  line: number;
  column: number;
  key: string;
  namespace: string;
  message: string;
}

export interface LintOptions {
  cwd?: string;
  srcDir?: string;
}

const TRANSLATION_CALL_REGEX = /t\(['"]([^'"]+)['"]\)/g;

export async function lintTranslations(options: LintOptions = {}): Promise<LintResult[]> {
  const cwd = options.cwd ?? process.cwd();
  const srcDir = options.srcDir ?? join(cwd, 'src');
  const config = await loadConfig(cwd);

  const namespaces = await findNamespaces(config.localesDir, config.defaultLocale);
  const validKeys: Record<string, Set<string>> = {};

  for (const namespace of namespaces) {
    const messages = await readNamespaceMessages(
      config.localesDir,
      config.defaultLocale,
      namespace,
    );
    validKeys[namespace] = new Set(flattenKeys(messages));
  }

  const results: LintResult[] = [];
  const files = await findSourceFiles(srcDir);

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match: RegExpExecArray | null;
      while ((match = TRANSLATION_CALL_REGEX.exec(line)) !== null) {
        const key = match[1];
        const namespace = 'common'; // simplistic default
        const valid = validKeys[namespace]?.has(key);

        if (!valid) {
          results.push({
            file,
            line: i + 1,
            column: match.index + 1,
            key,
            namespace,
            message: `Translation key "${key}" not found in namespace "${namespace}"`,
          });
        }
      }
    }
  }

  return results;
}

async function findSourceFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await findSourceFiles(path)));
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(path);
      }
    }
  } catch {
    // ignore
  }
  return files;
}
