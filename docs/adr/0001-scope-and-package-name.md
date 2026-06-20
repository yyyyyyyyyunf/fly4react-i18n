# ADR-0001: Scope and Package Name

## Status

Accepted

## Context

The original project, `react-native-localize-ext`, was created several years ago as a React Native focused i18n helper. Its name and package scope (`react-native-localize-ext` / `@react-native-localize-ext/*`) reflect that origin. However, the runtime code has no React Native specific dependencies or APIs; it is a general-purpose i18n runtime with a React binding.

We want to redesign the library from the ground up using current frontend best practices and create a new repository, while archiving the old one.

## Decision

We will reposition the library as a **general-purpose React i18n library**, not a React Native specific one. The new packages will be published under the npm scope `@fly4react` (e.g. `@fly4react/i18n-core`, `@fly4react/i18n-react`). The old repository will be archived and its npm packages deprecated with a pointer to the new scope.

## Consequences

- The new name accurately describes the audience and avoids confusion.
- Existing React Native users of the old package can continue using the archived version or migrate to the new general-purpose packages.
- Marketing, documentation, and examples must target the broader React ecosystem (web, React Native, SSR).

## Alternatives Considered

- Keep the old `react-native-localize-ext` name and only update internals. Rejected because the name actively misrepresents the library's scope.
- Rename to `react-localize-ext` to keep brand continuity. Rejected because the `@fly4react` scope was preferred by the author for a fresh start.
