import { useRef } from 'react';

/**
 * Returns a ref that always holds the latest value.
 *
 * Useful for the Ref-escape pattern: keep a callback identity stable
 * while still reading fresh props/state inside it.
 */
export function useLatestValueRef<T>(value: T): { current: T } {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
