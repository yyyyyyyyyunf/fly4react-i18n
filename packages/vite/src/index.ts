import { generate, check } from '@fly4react/i18n-cli';
import type { Plugin } from 'vite';
import type { CliConfig } from '@fly4react/i18n-cli';

export interface Fly4ReactI18nViteOptions extends Partial<CliConfig> {
  checkOnBuild?: boolean;
}

export function fly4reactI18n(options: Fly4ReactI18nViteOptions = {}): Plugin {
  const { checkOnBuild = true, ...config } = options;

  async function runGenerate(cwd: string) {
    await generate(cwd, config);
  }

  async function runCheck(cwd: string): Promise<boolean> {
    return check(cwd, config);
  }

  return {
    name: 'fly4react-i18n',
    async buildStart() {
      const cwd = process.cwd();
      await runGenerate(cwd);
      if (checkOnBuild) {
        const ok = await runCheck(cwd);
        if (!ok) {
          throw new Error('Locale check failed');
        }
      }
    },
    configureServer(server) {
      server.watcher.add('locales/**');
      server.watcher.on('change', async (path) => {
        if (path.includes('/locales/') || path.includes('\\locales\\')) {
          await runGenerate(process.cwd());
        }
      });
    },
  };
}

export default fly4reactI18n;
