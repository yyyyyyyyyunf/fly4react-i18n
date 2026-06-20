#!/usr/bin/env node
import { Command } from 'commander';
import { generate } from './generate.js';
import { check } from './check.js';

const program = new Command();

program.name('fly4react-i18n').description('CLI for @fly4react/i18n').version('0.0.0');

program
  .command('generate')
  .description('Generate TypeScript types and precompiled messages from locale files')
  .option('-c, --cwd <path>', 'working directory', process.cwd())
  .action(async (options) => {
    await generate(options.cwd);
  });

program
  .command('check')
  .description('Check that all locales are complete relative to the default locale')
  .option('-c, --cwd <path>', 'working directory', process.cwd())
  .action(async (options) => {
    const ok = await check(options.cwd);
    process.exit(ok ? 0 : 1);
  });

program.parse();
