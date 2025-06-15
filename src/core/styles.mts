import { StyleOptions } from './types.mts';
import * as path from 'path';
import * as fs from 'fs';
import postcss from 'postcss';
import type { Config } from 'tailwindcss';
import sass from 'sass';

type StyleType = StyleOptions['type'];

type PostCSSPlugin = {
  postcssPlugin: string;
  [key: string]: unknown;
};

type PostCSSResult = {
  css: string;
  [key: string]: unknown;
};

type PostCSSProcessor = {
  process(css: string, options?: { from?: string }): Promise<PostCSSResult>;
  use(...plugins: PostCSSPlugin[]): PostCSSProcessor;
};

type SassResult = {
  css: Buffer;
  toString(): string;
};

type SassOptions = {
  data: string;
  file?: string;
  includePaths?: string[];
};

type SassAPI = {
  renderSync(options: SassOptions): SassResult;
};

type PostCSSFactory = {
  (): PostCSSProcessor;
};

type TailwindFactory = {
  default: (config: Config) => PostCSSPlugin;
};

type AutoprefixerFactory = {
  default: () => PostCSSPlugin;
};

export class StyleProcessor {
  private cache: Map<string, string> = new Map();
  private postcssProcessor: PostCSSProcessor;
  private sassProcessor: SassAPI;
  
  constructor(private rootDir: string) {
    this.postcssProcessor = (postcss as unknown as PostCSSFactory)();
    this.sassProcessor = sass as unknown as SassAPI;
  }

  async processStyles(options: StyleOptions): Promise<string> {
    const cacheKey = [
      options.path ?? '',
      options.content ?? '',
      options.type
    ].join(':');

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (!cached) {
        throw new Error('Cache entry was undefined');
      }
      return cached;
    }

    let css = options.content ?? '';
    if (options.path) {
      const fullPath = path.resolve(this.rootDir, options.path);
      css = await fs.promises.readFile(fullPath, 'utf-8');
    }

    let processedCss = '';
    const type = options.type;
    switch (type) {
      case 'tailwind':
      case 'scss':
      case 'css': {
        processedCss = await this.processStyleByType(css, type, options.path);
        break;
      }
      default: {
        // This ensures type is never at runtime
        throw new Error(`Unsupported style type: ${String(type)}`);
      }
    }

    this.cache.set(cacheKey, processedCss);
    return processedCss;
  }

  private async processStyleByType(css: string, type: StyleType, filePath?: string): Promise<string> {
    switch (type) {
      case 'tailwind':
        return this.processTailwind(css);
      case 'scss':
        return this.processSass(css, filePath);
      case 'css':
        return this.processCSS(css);
    }
  }

  private async processTailwind(css: string): Promise<string> {
    const { default: tailwindcss } = await import('tailwindcss') as unknown as TailwindFactory;
    const { default: autoprefixer } = await import('autoprefixer') as unknown as AutoprefixerFactory;
    
    const result = await this.postcssProcessor
      .use(
        tailwindcss({
          content: [
            path.join(this.rootDir, '**/*.{js,jsx,ts,tsx,html}')
          ],
          theme: {
            extend: {}
          }
        } satisfies Config),
        autoprefixer()
      )
      .process(css, { from: undefined });

    return result.css;
  }

  private processSass(css: string, filePath?: string): string {
    const options: SassOptions = {
      data: css,
      file: filePath,
      includePaths: [this.rootDir]
    };

    const result = this.sassProcessor.renderSync(options);
    return result.css.toString();
  }

  private async processCSS(css: string): Promise<string> {
    const { default: autoprefixer } = await import('autoprefixer') as unknown as AutoprefixerFactory;
    
    const result = await this.postcssProcessor
      .use(autoprefixer())
      .process(css, { from: undefined });

    return result.css;
  }
} 