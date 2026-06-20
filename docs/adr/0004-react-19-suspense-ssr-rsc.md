# ADR-0004: React 19, Suspense, SSR, and RSC

## Status

Accepted

## Context

The original library uses a class-based instance and a Higher-Order Component (`I18nProvider`) to trigger re-renders. Modern React favors hooks, Suspense for async data, and Server Components. Supporting both client and server rendering is now expected for React i18n libraries.

## Decision

We will target **React 19 as the minimum supported version** and design the library around:

- `createI18n` as a configuration factory (no mutable singleton state).
- React Context to hold the active locale and loaded namespaces.
- `useTranslation(namespace?)` throwing a Promise while its namespace is loading, so Suspense boundaries can render fallback UI by default.
- An `isLoading`-based variant for users who cannot use Suspense.
- A separate `/server` export providing async APIs such as `getTranslations(locale, namespace)` for React Server Components and SSR preload/hydration.

## Consequences

- We can rely on React 19 features (e.g. `use`) without compatibility shims.
- The API is smaller because class components and HOCs are no longer first-class.
- SSR/RSC support adds a second code path that must be tested and documented.
- Users on React 18 must upgrade or stay on the archived package.

## Alternatives Considered

- Support React 18.3+. Rejected because it complicates Suspense integration and the author prefers to baseline on the latest version.
- Implement SSR by wrapping the instance per request without a server entry. Rejected because a dedicated `/server` API makes RSC boundaries explicit and avoids leaking client code into server bundles.
