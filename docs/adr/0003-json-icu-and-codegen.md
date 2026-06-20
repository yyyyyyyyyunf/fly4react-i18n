# ADR-0003: JSON, ICU MessageFormat, and Codegen

## Status

Accepted

## Context

The original library stores messages in TypeScript objects using a custom `{{name}}` interpolation syntax. We want:

- Strong compile-time type safety for keys and interpolation params.
- Industry-standard pluralization and formatting.
- Easy editing by both developers and AI/translation tools.
- Development-time checks that all locales are complete relative to the default locale.

## Decision

We will:

1. Store every locale as JSON files (optionally organized by namespace directories).
2. Use ICU MessageFormat for message values, supporting placeholders, pluralization, select, and built-in number/date/list/relative-time formatting through native `Intl` APIs.
3. Run codegen on the default locale JSON to emit TypeScript type definitions for keys and params.
4. Precompile ICU strings into ASTs during codegen so the runtime only formats, not parses.
5. Provide a CLI (`check`) that verifies every non-default locale contains all keys defined in the default locale.

## Consequences

- Translation files are uniform, AI-friendly, and tool-friendly.
- Pluralization and formatting follow a well-documented standard.
- Type safety no longer depends on brittle Proxy type inference.
- The build workflow gains a codegen step that must run before TypeScript can validate keys.
- The runtime depends on `@formatjs/icu-messageformat-parser` (or the precompiled AST equivalent).

## Alternatives Considered

- Keep TypeScript objects as the source of truth. Rejected because it mixes translation data with code and makes tooling harder.
- Use a custom `{{name}}` syntax. Rejected because it cannot express pluralization and formatting without inventing a new standard.
- Generate types from ICU strings at the TypeScript type level. Rejected because parsing ICU in conditional types is unmaintainable; codegen is more reliable.
