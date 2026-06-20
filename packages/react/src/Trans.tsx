import { cloneElement, isValidElement } from 'react';
import { useTranslation } from './useTranslation.js';
import type { ReactNode, ReactElement } from 'react';

export interface TransProps {
  i18nKey: string;
  namespace?: string;
  values?: Record<string, unknown>;
  components?: Record<string, ReactNode>;
}

export function Trans({ i18nKey, namespace = 'common', values = {}, components = {} }: TransProps) {
  const { t } = useTranslation(namespace, { suspense: false });

  const richValues: Record<string, unknown> = { ...values };
  for (const [key, component] of Object.entries(components)) {
    richValues[key] = (chunks: ReactNode[]) => <Wrap component={component} chunks={chunks} />;
  }

  return t.rich(i18nKey, richValues) as ReactNode;
}

function Wrap({ component, chunks }: { component: ReactNode; chunks: ReactNode[] }) {
  if (isValidElement(component)) {
    return cloneElement(component as ReactElement, {}, chunks);
  }
  return chunks;
}
