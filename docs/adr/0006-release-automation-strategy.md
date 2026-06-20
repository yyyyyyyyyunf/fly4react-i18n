# ADR-0006: Release Automation Strategy

## Status

Accepted

## Context

The project is a pnpm monorepo with six independently published packages under the `@fly4react` scope. The root `package.json` already uses `@changesets/cli` and exposes `changeset version` / `changeset publish` scripts. We need a release workflow that:

- Publishes the correct packages without forgetting internal dependency bumps;
- Supports prereleases (`alpha`, `beta) without polluting the `latest` dist-tag;
- Minimises manual steps and cognitive load for the maintainer;
- Produces npm provenance attestations and GitHub Releases automatically.

## Decision

We will use **Changesets** for version and changelog management, but deviate from the default "publish on every push to `main`" model. Instead, we introduce a **long-lived `release` branch** as the publishing channel:

1. Day-to-day development happens on `main`; changeset files are committed to `main`.
2. To publish, the maintainer runs `pnpm release <packages> <bump>` (or asks the `release` skill to do it). The script:
   - checks out `release`;
   - merges `main` into `release`;
   - runs `changeset add` and `changeset version`;
   - commits and pushes `release`.
3. Pushing to `origin/release` triggers the `release.yml` GitHub Action, which:
   - installs dependencies and builds all packages;
   - runs `changeset publish`;
   - creates one GitHub Release per published package from its `CHANGELOG.md`;
   - merges `release` back into `main`.
4. If the post-release merge into `main` conflicts, the workflow opens a PR instead of resolving the conflict automatically.
5. Prereleases are controlled by `.changeset/pre.json`:
   - `pnpm release pre enter alpha|beta` puts the repo into prerelease mode;
   - `pnpm release pre exit` leaves prerelease mode;
   - while in prerelease mode, `changeset publish` publishes to the matching npm dist-tag (`alpha` or `beta`).
6. npm provenance is enabled via the `NPM_CONFIG_PROVENANCE=true` environment variable in the publish job, which requires `id-token: write`.
7. Quality checks (`format:check`, `lint`, `test`, `build`) run in a separate `ci.yml` on every PR and push to `main`.

A project-local agent skill at `skills/release/SKILL.md` provides natural-language helpers for creating changesets, entering/exiting prerelease mode, and checking release status. The skill calls the `pnpm release ...` scripts for deterministic operations.

## Consequences

- The maintainer can publish with a single command or a single sentence to the agent, without manually editing `package.json` versions or changelogs.
- Internal workspace dependencies are bumped automatically by Changesets (`updateInternalDependencies: patch`).
- The `release` branch history clearly separates "version bumps" from "feature work" on `main`.
- npm provenance gives consumers confidence in the package origin.
- Prereleases are explicit and reversible via `.changeset/pre.json`.

## Alternatives Considered

- **Publish on every push to `main` with `changesets/action`**: rejected because the maintainer wants a deliberate release gate and a `release` branch workflow similar to `react-shimmer`.
- **Tag-triggered releases like `react-shimmer`**: rejected because a single `v*` tag cannot represent six independently versioned packages cleanly.
- **Fully local publish from the agent without CI**: rejected because publishing from CI is more auditable, keeps the npm token out of local environments, and supports provenance.
- **A generic, user-scope release skill**: rejected because the workflow is tied to this repository's branch model and package structure; a project-local skill is easier to maintain.
