# Context: @fly4react/i18n

## Domain Terms

### i18n library

A library that helps applications display text in different languages. In this project, it is a general-purpose i18n solution for React applications, not tied to React Native specifically.

### locale

A set of translated messages for a particular language or region, identified by a string such as `en`, `zh-CN`, or `fr-FR`.

### default locale

The locale whose message definitions are always available and are used as a fallback when a key is missing from the currently active locale. In the new design it is the single source of truth for the full set of valid translation keys.

### namespace

A named subdivision of a locale's messages, typically mapped to one JSON file, allowing messages to be loaded and typed per feature or route.

### locale loader

An asynchronous function that fetches or imports a locale's messages by name, enabling code-splitting of translation files.

### locale detector

A function that determines which locale should be active based on signals such as the URL, storage, or browser preferences.

### locale persistence

A mechanism that writes the active locale to storage (for example a cookie or localStorage) when it changes, so the same locale can be restored on the next request or session.

### i18n instance

A configuration object created by `createI18n`, holding the default locale, available locales, loader, and formatting options. React state is managed separately through context.

### type-safe translation key

A translation key that is validated at compile time by TypeScript, providing autocompletion and preventing references to undefined keys.

### typed interpolation params

Placeholder values passed to a translation function whose names and types are inferred from the message definition, so missing or incorrectly typed params are caught at compile time.

### dynamic key

A translation key that is only known at runtime, such as a value selected from a map. The library provides an opt-in escape hatch for dynamic keys while keeping the primary API type-safe.

### missing key handler

A runtime policy that decides what to render and what side effects to trigger when a translation key cannot be resolved, even after falling back to the default locale.

### locale completeness check

A development-time verification that every non-default locale contains a value for every key defined in the default locale, reporting missing or structurally mismatched keys with actionable diagnostics.

### development toolchain

Commands and build-tool plugins shipped alongside the runtime library to validate locale files and integrate checks into CI and local development workflows.

### message format

The syntax used inside a translation value to declare placeholders, pluralization, and formatting rules. The new design uses ICU MessageFormat.

### ICU MessageFormat

An industry-standard syntax for messages, supporting simple placeholders (`{name}`), plural forms (`{count, plural, ...}`), select forms, and number/date formatting.

### codegen

A development-time step that parses the default locale JSON files and emits TypeScript type definitions, so keys and interpolation params are type-safe without manual type annotations.

### ICU precompile

A codegen optimization that parses ICU message strings at build time and emits their AST, so the runtime only needs to format messages instead of parsing them.

### Suspense-ready loading

A loading strategy where `useTranslation` throws a Promise while its namespace messages are being fetched, allowing a React `<Suspense>` boundary to render a fallback UI.

### server-side rendering (SSR) support

The ability to resolve translations on the server, pass them to the client for hydration, and avoid mismatches between server-rendered and client-rendered markup.

### React Server Component (RSC) support

A separate server-only API that can be used inside React Server Components to fetch translations asynchronously without relying on client-side React context or hooks.

### rich text translation

A translation whose result is a React element tree rather than a plain string, allowing markup such as links or styled spans to be embedded inside localized text.

### ICU formatter

A formatting rule inside an ICU message that delegates to a formatting engine such as `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`, or a user-supplied custom formatter.

### workspace package

An independently published package inside the monorepo, each responsible for one layer of the library (runtime, React client, server, CLI, build-tool plugin).

### package scope

The npm scope under which the new library will be published. Decided as `@fly4react`.
