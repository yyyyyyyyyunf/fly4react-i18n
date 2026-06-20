import type { LocaleLoader, MessagesMap, NamespaceMessages } from './types.js';

export class MessageStore {
  private cache = new Map<string, NamespaceMessages>();
  private loading = new Map<string, Promise<void>>();

  constructor(
    private defaultLocale: string,
    private defaultMessages: MessagesMap,
    private loader?: LocaleLoader,
  ) {}

  private key(locale: string, namespace: string): string {
    return `${locale}:${namespace}`;
  }

  has(locale: string, namespace: string): boolean {
    if (locale === this.defaultLocale) {
      return namespace in this.defaultMessages;
    }
    return this.cache.has(this.key(locale, namespace));
  }

  get(locale: string, namespace: string): NamespaceMessages | undefined {
    if (locale === this.defaultLocale) {
      return this.defaultMessages[namespace];
    }
    return this.cache.get(this.key(locale, namespace));
  }

  async load(locale: string, namespace: string): Promise<void> {
    if (locale === this.defaultLocale) return;

    const cacheKey = this.key(locale, namespace);
    if (this.cache.has(cacheKey)) return;

    const existing = this.loading.get(cacheKey);
    if (existing) {
      await existing;
      return;
    }

    if (!this.loader) {
      return;
    }

    const loader = this.loader;
    const promise = (async () => {
      try {
        const messages = await loader(locale, namespace);
        if (messages) {
          this.cache.set(cacheKey, messages);
        }
      } finally {
        this.loading.delete(cacheKey);
      }
    })();

    this.loading.set(cacheKey, promise);
    await promise;
  }

  reset(): void {
    this.cache.clear();
    this.loading.clear();
  }
}
