import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { generate } from './generate.js';
import { check } from './check.js';

describe('CLI', () => {
  let cwd: string;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), 'fly4react-i18n-'));
    mkdirSync(join(cwd, 'locales', 'en'), { recursive: true });
    mkdirSync(join(cwd, 'locales', 'zh-CN'), { recursive: true });
    mkdirSync(join(cwd, 'src', 'generated', 'i18n'), { recursive: true });

    writeFileSync(
      join(cwd, 'locales', 'en', 'common.json'),
      JSON.stringify({
        hello: 'Hello {name}',
        count: 'You have {count, plural, one {# item} other {# items}}',
      }),
    );
    writeFileSync(
      join(cwd, 'locales', 'zh-CN', 'common.json'),
      JSON.stringify({
        hello: '你好 {name}',
        count: '你有 {count, plural, one {# 项} other {# 项}}',
      }),
    );
  });

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
  });

  it('generates types and precompiled messages', async () => {
    await generate(cwd, {
      defaultLocale: 'en',
      localesDir: join(cwd, 'locales'),
      outputDir: join(cwd, 'src', 'generated', 'i18n'),
    });

    const types = readFile(join(cwd, 'src', 'generated', 'i18n', 'messages.d.ts'));
    expect(types).toContain('export interface Messages');
    expect(types).toContain("'hello'");
    expect(types).toContain("'count'");

    const keys = readFile(join(cwd, 'src', 'generated', 'i18n', 'keys.ts'));
    expect(keys).toContain('hello:');
    expect(keys).toContain('count:');

    const messages = readFile(join(cwd, 'src', 'generated', 'i18n', 'messages.ts'));
    expect(messages).toContain('export const messages');
  });

  it('passes check when locales are complete', async () => {
    const ok = await check(cwd, {
      defaultLocale: 'en',
      localesDir: join(cwd, 'locales'),
      outputDir: join(cwd, 'src', 'generated', 'i18n'),
    });
    expect(ok).toBe(true);
  });

  it('fails check when a key is missing', async () => {
    writeFileSync(
      join(cwd, 'locales', 'zh-CN', 'common.json'),
      JSON.stringify({ hello: '你好 {name}' }),
    );

    const ok = await check(cwd, {
      defaultLocale: 'en',
      localesDir: join(cwd, 'locales'),
      outputDir: join(cwd, 'src', 'generated', 'i18n'),
    });
    expect(ok).toBe(false);
  });
});

function readFile(path: string): string {
  return readFileSync(path, 'utf-8');
}
