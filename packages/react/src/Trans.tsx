import { cloneElement, isValidElement, useMemo } from 'react';
import { useTranslation } from './useTranslation.js';
import { useLatestValueRef } from './hooks/useLatestValueRef.js';
import type { ReactNode, ReactElement } from 'react';

export interface TransProps {
  i18nKey: string;
  namespace?: string;
  values?: Record<string, unknown>;
  components?: Record<string, ReactNode>;
}

export function Trans({ i18nKey, namespace = 'common', values = {}, components = {} }: TransProps) {
  const { t } = useTranslation(namespace, { suspense: false });
  const componentsRef = useLatestValueRef(components);

  const keySignature = Object.keys(components).sort().join(',');

  const richValues = useMemo(() => {
    const result: Record<string, unknown> = { ...values };
    for (const key of Object.keys(components)) {
      result[key] = (chunks: ReactNode[]) => (
        <Wrap component={componentsRef.current[key]} chunks={chunks} />
      );
    }
    return result;
  }, [values, keySignature, componentsRef]);

  return t.rich(i18nKey, richValues) as ReactNode;
}

function Wrap({ component, chunks }: { component: ReactNode; chunks: ReactNode[] }) {
  if (isValidElement(component)) {
    return cloneElement(component as ReactElement, {}, chunks);
  }
  return chunks;
}
