#!/usr/bin/env node
/* eslint-disable no-console */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PACKAGE_ALIASES = {
  core: '@fly4react/i18n-core',
  react: '@fly4react/i18n-react',
  server: '@fly4react/i18n-server',
  cli: '@fly4react/i18n-cli',
  vite: '@fly4react/i18n-vite',
  oxlint: '@fly4react/i18n-oxlint',
};

const VALID_BUMPS = ['patch', 'minor', 'major'];
const VALID_PRE_TAGS = ['alpha', 'beta'];

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', ...opts });
}

function runInherit(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function log(message) {
  console.log(`[release] ${message}`);
}

function getCurrentBranch() {
  return run('git branch --show-current').trim();
}

function ensureCleanWorkingTree() {
  const status = run('git status --porcelain').trim();
  if (status) {
    throw new Error(
      'Working tree is not clean. Please commit or stash changes before running release commands.',
    );
  }
}

function fetchBranches() {
  run('git fetch origin main --no-tags');
  try {
    run('git fetch origin release --no-tags');
  } catch {
    // release branch may not exist yet
  }
}

function ensureReleaseBranch() {
  const branch = getCurrentBranch();
  if (branch !== 'release') {
    const remoteBranches = run('git branch -r').trim();
    if (remoteBranches.includes('origin/release')) {
      runInherit('git checkout release');
    } else {
      runInherit('git checkout -b release origin/main');
    }
  }
  runInherit('git pull origin release');
  runInherit('git merge origin/main --no-edit');
}

function readPreMode() {
  const prePath = path.join(process.cwd(), '.changeset', 'pre.json');
  if (!fs.existsSync(prePath)) return null;
  return JSON.parse(fs.readFileSync(prePath, 'utf8'));
}

function listUnreleasedChangesets() {
  const changesetDir = path.join(process.cwd(), '.changeset');
  if (!fs.existsSync(changesetDir)) return [];
  return fs
    .readdirSync(changesetDir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((f) => {
      const content = fs.readFileSync(path.join(changesetDir, f), 'utf8');
      const summary = content.split('---')[2]?.trim().split('\n')[0].trim();
      return { file: f, summary: summary || '(no summary)' };
    });
}

function parsePackages(input) {
  if (input === '--all') {
    return Object.values(PACKAGE_ALIASES);
  }
  const names = input.split(',').map((s) => s.trim());
  const result = [];
  for (const name of names) {
    const fullName = PACKAGE_ALIASES[name];
    if (!fullName) {
      throw new Error(
        `Unknown package alias "${name}". Valid aliases: ${Object.keys(PACKAGE_ALIASES).join(', ')}`,
      );
    }
    result.push(fullName);
  }
  return result;
}

function generateChangeset(packages, bump) {
  const id = crypto.randomUUID();
  const file = path.join(process.cwd(), '.changeset', `${id}.md`);
  const packageLines = packages.map((pkg) => `"${pkg}": ${bump}`);
  const shortNames = packages.map((pkg) => pkg.split('/')[1]).join(', ');
  const content = ['---', ...packageLines, '---', '', `Release ${shortNames} as ${bump}`].join(
    '\n',
  );
  fs.writeFileSync(file, content);
  return file;
}

function status() {
  const branch = getCurrentBranch();
  const pre = readPreMode();
  const changesets = listUnreleasedChangesets();

  console.log('--- Release Status ---');
  console.log(`Current branch: ${branch}`);
  console.log(`Pre mode: ${pre ? `${pre.tag} (mode: ${pre.mode})` : 'none'}`);
  console.log(`Unreleased changesets: ${changesets.length}`);
  for (const c of changesets) {
    console.log(`  - ${c.file}: ${c.summary}`);
  }

  try {
    const releaseBehind = run(
      'git rev-list --count origin/release..origin/main 2>/dev/null',
    ).trim();
    console.log(`release branch behind main: ${releaseBehind} commits`);
  } catch {
    console.log('release branch: not tracked or not available');
  }
}

function preEnter(tag) {
  ensureCleanWorkingTree();
  fetchBranches();
  ensureReleaseBranch();

  const existing = readPreMode();
  if (existing) {
    throw new Error(`Already in pre mode: ${existing.tag}. Run "pnpm release pre exit" first.`);
  }

  runInherit(`pnpm exec changeset pre enter ${tag}`);
  runInherit('git add .changeset/pre.json');
  runInherit(`git commit -m "chore: enter ${tag} prerelease mode"`);
  runInherit('git push origin release');
  log(`Entered ${tag} prerelease mode and pushed to release.`);
}

function preExit() {
  ensureCleanWorkingTree();
  fetchBranches();
  ensureReleaseBranch();

  const existing = readPreMode();
  if (!existing) {
    throw new Error('Not in pre mode.');
  }

  runInherit('pnpm exec changeset pre exit');
  runInherit('git add .changeset/pre.json');
  runInherit('git commit -m "chore: exit prerelease mode"');
  runInherit('git push origin release');
  log(`Exited ${existing.tag} prerelease mode and pushed to release.`);
}

function releasePackages(packagesArg, bump, dryRun = false) {
  const packages = parsePackages(packagesArg);
  if (!VALID_BUMPS.includes(bump)) {
    throw new Error(`Invalid bump "${bump}". Must be one of: ${VALID_BUMPS.join(', ')}`);
  }

  if (dryRun) {
    console.log('--- Dry Run ---');
    console.log(`Packages: ${packages.join(', ')}`);
    console.log(`Bump: ${bump}`);
    console.log('Would create changeset:');
    console.log('---');
    for (const pkg of packages) {
      console.log(`"${pkg}": ${bump}`);
    }
    console.log('---');
    console.log('Then run: pnpm exec changeset version');
    console.log('Then commit and push to release branch.');
    return;
  }

  ensureCleanWorkingTree();
  fetchBranches();
  ensureReleaseBranch();

  const changesetFile = generateChangeset(packages, bump);
  log(`Created ${changesetFile}`);

  runInherit('pnpm exec changeset version');

  runInherit('git add .');
  const shortNames = packages.map((pkg) => pkg.split('/')[1]).join(', ');
  runInherit(`git commit -m "chore: release ${shortNames} as ${bump}"`);
  runInherit('git push origin release');
  log(`Pushed release commit to origin/release.`);
}

function showUsage() {
  console.log(`Usage:
  pnpm release status
  pnpm release pre enter alpha|beta
  pnpm release pre exit
  pnpm release <packages> <bump> [--dry-run]

Examples:
  pnpm release core patch
  pnpm release core,react minor
  pnpm release --all patch
  pnpm release core patch --dry-run

Package aliases: ${Object.keys(PACKAGE_ALIASES).join(', ')}
Bump levels: ${VALID_BUMPS.join(', ')}`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    showUsage();
    process.exit(1);
  }

  const [first, second, third, ...rest] = args;

  try {
    if (first === 'status') {
      status();
      return;
    }

    if (first === 'pre') {
      if (second === 'enter' && VALID_PRE_TAGS.includes(third)) {
        preEnter(third);
        return;
      }
      if (second === 'exit') {
        preExit();
        return;
      }
      throw new Error('Invalid prerelease command. Use "pre enter alpha|beta" or "pre exit".');
    }

    // release <packages> <bump> [--dry-run]
    const packagesArg = first;
    const bump = second;
    const dryRun = rest.includes('--dry-run') || third === '--dry-run';
    releasePackages(packagesArg, bump, dryRun);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
