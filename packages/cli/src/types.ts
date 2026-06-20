export interface CliConfig {
  defaultLocale: string;
  localesDir: string;
  outputDir: string;
  precompile?: boolean;
}

export interface NamespaceData {
  name: string;
  keys: string[];
  params: Record<string, string[]>;
}
