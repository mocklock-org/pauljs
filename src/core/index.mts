import { ComponentLoader } from './loader.mts';
import type { StyleProcessor } from './styles.mts';
import type { 
  PaulJSConfig, 
  PageConfig, 
  StyleOptions, 
  PageSection,
  ProcessedPageSection
} from './types.mts';
import * as path from 'path';
import * as fs from 'fs';

type ConfigModule = {
  default: PaulJSConfig;
};

type ComponentFunction = (props: Record<string, unknown>) => string;

type Component = ComponentFunction | string;

export class PaulJS {
  private componentLoader: ComponentLoader;
  private styleProcessor!: StyleProcessor;
  private config!: PaulJSConfig;

  constructor(private rootDir: string) {
    this.componentLoader = new ComponentLoader(rootDir);
    // Handle promise rejection
    void this.initialize().catch(error => {
      console.error('Failed to initialize PaulJS:', error);
    });
  }

  private async initialize(): Promise<void> {
    const { StyleProcessor } = await import('./styles.mts');
    this.styleProcessor = new StyleProcessor(this.rootDir);
    this.config = await this.loadConfig();
  }

  private async loadConfig(): Promise<PaulJSConfig> {
    const configPath = path.join(this.rootDir, 'pauljs.config.js');
    if (fs.existsSync(configPath)) {
      const config = await import(configPath) as ConfigModule;
      return config.default;
    }
    return {
      pages: {},
      globalStyles: []
    };
  }

  async createPage(route: string, config: PageConfig): Promise<void> {
    // Process all sections
    const processedSections = await Promise.all(
      config.sections.map(async (section: PageSection) => {
        // Load component
        const component = await this.componentLoader.loadComponent(section.component);
        
        // Process section styles
        const sectionStyles = section.styles || [];
        const processedStyles = await Promise.all(
          sectionStyles.map((style: StyleOptions) => this.styleProcessor.processStyles(style))
        );

        return {
          component: {
            name: section.component.name,
            component,
            props: section.component.props
          },
          styles: processedStyles,
          layout: section.layout
        } as ProcessedPageSection;
      })
    );

    // Process global page styles
    const globalStyles = config.styles || [];
    const processedGlobalStyles = await Promise.all(
      globalStyles.map(style => this.styleProcessor.processStyles(style))
    );

    // Store the page configuration
    this.config.pages[route] = {
      meta: config.meta,
      sections: processedSections,
      styles: processedGlobalStyles
    };
  }

  async renderPage(route: string): Promise<string> {
    const pageConfig = this.config.pages[route];
    if (!pageConfig) {
      throw new Error(`Page not found: ${route}`);
    }

    // Sort sections by order if specified
    const sortedSections = [...pageConfig.sections].sort((a, b) => 
      (a.layout?.order ?? Infinity) - (b.layout?.order ?? Infinity)
    );

    // Render each section
    const sections = sortedSections.map(section => {
      const component = section.component.component as Component;
      const renderedComponent = typeof component === 'function' 
        ? component(section.component.props || {})
        : component;

      if (section.layout?.container) {
        return `<div class="${section.layout.container}${section.layout.className ? ' ' + section.layout.className : ''}">${renderedComponent}</div>`;
      }
      return renderedComponent;
    }).join('\n');

    // Combine all styles
    const allStyles = await Promise.all([
      ...(this.config.globalStyles || []).map(style => style.content || ''),
      ...(pageConfig.styles || []),
      ...sortedSections.flatMap(section => section.styles || [])
    ]).then(styles => styles.filter(Boolean).join('\n'));

    // Create the HTML document
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${pageConfig.meta.title}</title>
          <meta name="description" content="${pageConfig.meta.description}">
          <style>${allStyles}</style>
          ${this.config.tailwind ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}
        </head>
        <body>
          <div id="root">
            ${sections}
          </div>
        </body>
      </html>
    `;
  }

  getConfig(): PaulJSConfig {
    return this.config;
  }

  setConfig(config: Partial<PaulJSConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }
} 