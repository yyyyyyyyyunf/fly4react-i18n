import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { lintTranslations } from './index.js';

describe('lintTranslations', () => {
  let cwd: string;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), 'fly4react-i18n-oxlint-'));
    mkdirSync(join(cwd, 'locales', 'en'), { recursive: true });
    mkdirSync(join(cwd, 'src'), { recursive: true });

    writeFileSync(
      join(cwd, 'locales', 'en', 'common.json'),
      JSON.stringify({ hello: 'Hello', world: 'World' }),
    );
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
  });

  it('reports invalid translation keys', async () => {
    writeFileSync(join(cwd, 'src', 'App.tsx'), "const x = t('missing');");

    const results = await lintTranslations({ cwd, srcDir: join(cwd, 'src') });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].key).toBe('missing');
  });

  it('passes for valid keys', async () => {
    writeFileSync(join(cwd, 'src', 'App.tsx'), "const x = t('hello');");

    const results = await lintTranslations({ cwd, srcDir: join(cwd, 'src') });
    expect(results).toEqual([]);
  });
});
