# ADR-0002: Function-Based API Over Proxy

## Status

Accepted

## Context

The original library exposes translations through a Proxy-based chain API:

```ts
const i18n = createI18n({ defaultLocale: { key: 'en', values: en } });
i18n.greeting.hello({ name: 'World' });
```

This provides dot-notation autocompletion but has significant drawbacks:

- It cannot express dynamic keys without escaping the type system.
- It cannot naturally support pluralization, ICU messages, namespaces, or rich text.
- Type inference requires complex conditional types that are brittle and hard to maintain.
- Debugging is harder because the value is a Proxy, not a plain function.
- It does not fit modern React patterns (hooks, Suspense, SSR).

## Decision

We will replace the Proxy chain API with a function-based API:

```ts
const { t } = useTranslation('home');
t('greeting.hello', { name: 'World' });
t.rich('tos', { link: (chunks) => <a href="/tos">{chunks}</a> });
t.raw('dynamic.key'); // escape hatch for runtime keys
```

Type safety will be provided by codegen from the default locale JSON files, producing typed keys and params instead of relying on runtime Proxy types.

## Consequences

- The API becomes explicit, debuggable, and compatible with Suspense, SSR, and RSC.
- Rich text, pluralization, and formatting can share one ICU-based message format.
- Dynamic keys are still possible through an opt-in escape hatch.
- Existing Proxy-based code cannot be migrated mechanically; a migration guide is required.

## Alternatives Considered

- Keep the Proxy chain API and add a separate `t()` function. Rejected because maintaining two first-class APIs increases surface area and the Proxy API limits future features.
- Generate a typed object tree at build time. Rejected because it still cannot support dynamic keys or rich text cleanly.
