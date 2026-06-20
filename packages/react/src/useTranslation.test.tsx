import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { I18nProvider } from './Provider.js';
import { useTranslation } from './useTranslation.js';
import { createI18n } from '@fly4react/i18n-core';

describe('useTranslation', () => {
  function TestComponent() {
    const { t } = useTranslation('common', { suspense: false });
    return <div>{t('hello', { name: 'World' })}</div>;
  }

  it('renders translated text from default locale', () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      messages: {
        common: {
          hello: 'Hello {name}',
        },
      },
    });

    render(
      <I18nProvider i18n={i18n}>
        <TestComponent />
      </I18nProvider>,
    );

    expect(screen.getByText('Hello World')).toBeDefined();
  });

  it('loads namespace via loader and renders with Suspense', async () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      locales: ['en', 'zh-CN'],
      messages: {
        common: {
          hello: 'Hello {name}',
        },
      },
      loader: vi.fn(async (locale) => {
        if (locale === 'zh-CN') {
          return { hello: '你好 {name}' };
        }
        return undefined;
      }),
    });

    function ZhComponent() {
      const { t } = useTranslation('common');
      return <div>{t('hello', { name: 'World' })}</div>;
    }

    render(
      <I18nProvider i18n={i18n} locale="zh-CN">
        <Suspense fallback={<div>Loading...</div>}>
          <ZhComponent />
        </Suspense>
      </I18nProvider>,
    );

    expect(screen.getByText('Loading...')).toBeDefined();
    await waitFor(() => expect(screen.getByText('你好 World')).toBeDefined());
  });

  it('renders rich text', () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      messages: {
        common: {
          tos: 'Please read our <link>Terms of Service</link>.',
        },
      },
    });

    function RichComponent() {
      const { t } = useTranslation('common', { suspense: false });
      return (
        <div>
          {t.rich('tos', {
            link: (chunks: ReactNode[]) => <a href="/tos">{chunks}</a>,
          })}
        </div>
      );
    }

    render(
      <I18nProvider i18n={i18n}>
        <RichComponent />
      </I18nProvider>,
    );

    const link = screen.getByText('Terms of Service');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/tos');
  });
});
