# ADR-0005: pnpm Workspace and Package Split

## Status

Accepted

## Context

The original repository uses Lerna 3 with a two-package monorepo (`core`, `react`). Lerna is no longer the modern standard, and the runtime/CLI/build-tool responsibilities need clearer separation. We also need packages for CLI tooling, Vite/Rollup integration, and server APIs.

## Decision

We will migrate to **pnpm workspaces** and split the project into focused packages under the `@fly4react` scope:

- `@fly4react/i18n-core` — pure runtime: ICU formatting, message resolution, locale loading, configuration.
- `@fly4react/i18n-react` — client React bindings: hooks, provider, Suspense integration.
- `@fly4react/i18n-server` — RSC/SSR APIs and hydration helpers.
- `@fly4react/i18n-cli` — codegen and locale completeness checks.
- `@fly4react/i18n-vite` — Vite/Rollup plugin that invokes the CLI.
- `@fly4react/i18n-oxlint` (or equivalent integration) — lint rule for invalid translation keys.

Package versioning and publishing will be managed with Changesets.

## Consequences

- Users install only what they need (e.g. server apps do not pull in client hooks).
- Tree-shaking and bundle analysis are easier.
- The monorepo has more packages to maintain, but pnpm + Changesets keep the overhead low.

## Alternatives Considered

- Keep Lerna. Rejected because pnpm workspaces with Changesets is the current community standard.
- Merge CLI and Vite plugin into one package. Rejected because non-Vite users should not install Vite-specific code.
