import { describe, it, expect } from 'vitest';
import { fly4reactI18n } from './index.js';

describe('fly4reactI18n', () => {
  it('returns a Vite plugin object', () => {
    const plugin = fly4reactI18n();
    expect(plugin.name).toBe('fly4react-i18n');
    expect(typeof plugin.buildStart).toBe('function');
  });
});
