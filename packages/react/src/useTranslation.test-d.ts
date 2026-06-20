import { describe, expectTypeOf, it } from 'vitest';
import { createTypedI18nReact } from './useTranslation.js';
import type { MessagesMap } from '@fly4react/i18n-core';

interface TestMessages extends MessagesMap {
  common: {
    greeting: string;
    counter: string;
  };
}

interface TestParams {
  'common.greeting': { name: string };
  'common.counter': { count: number };
}

const { useTranslation } = createTypedI18nReact<TestMessages, TestParams>();

describe('typed useTranslation', () => {
  it('infers key type from namespace', () => {
    const { t } = useTranslation('common');
    expectTypeOf(t).parameter(0).toEqualTypeOf<'greeting' | 'counter'>();
  });

  it('accepts typed params', () => {
    const { t } = useTranslation('common');
    expectTypeOf(t<'greeting'>)
      .parameter(0)
      .toEqualTypeOf<'greeting'>();
    expectTypeOf(t<'greeting'>)
      .parameter(1)
      .toEqualTypeOf<{ name: string } | undefined>();
  });
});
