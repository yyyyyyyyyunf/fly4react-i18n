import { describe, it, expect } from 'vitest';
import { formatRich } from './rich.js';

describe('formatRich', () => {
  const formatText = (text: string) => text;

  it('returns plain text when no tags', () => {
    const result = formatRich('Hello {name}', { name: 'World' }, formatText);
    expect(result).toEqual(['Hello {name}']);
  });

  it('applies tag handlers', () => {
    const result = formatRich(
      'Please read our <link>Terms of Service</link>.',
      {
        link: (chunks) => `[LINK:${chunks.join('')}]`,
      },
      formatText,
    );
    expect(result).toEqual(['Please read our ', '[LINK:Terms of Service]', '.']);
  });

  it('preserves tags as text when handler is missing', () => {
    const result = formatRich('Hello <b>world</b>', {}, formatText);
    expect(result).toEqual(['Hello ', '<b>', 'world', '</b>']);
  });

  it('handles nested tags', () => {
    const result = formatRich(
      'Outer <a>inner <b>bold</b> text</a> end',
      {
        a: (chunks) => `[A:${chunks.join('')}]`,
        b: (chunks) => `[B:${chunks.join('')}]`,
      },
      formatText,
    );
    expect(result).toEqual(['Outer ', '[A:inner [B:bold] text]', ' end']);
  });
});
