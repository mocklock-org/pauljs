import * as fs from 'fs/promises';
import * as path from 'path';
import express from 'express';
import type { Express } from 'express';
import type { Server } from 'http';
import ejs from 'ejs';
import { PaulJSCore } from './core.mts';
import type { PageConfig, ProcessedPageConfig, Component } from './types.mts';

export class PaulJS {
  private app: Express;
  private pages: Map<string, ProcessedPageConfig>;
  private core: PaulJSCore;
  private server: Server | null;
  
  constructor() {
    this.app = express();
    this.pages = new Map();
    this.core = new PaulJSCore();
    this.server = null;
    
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    this.app.use(express.static('public'));
    this.app.use('/styles', express.static(path.join(process.cwd(), 'styles')));
    this.app.use(express.json());
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'templates'));
  }

  async createPage(route: string, config: PageConfig): Promise<string> {
    try {
      const defaultConfig: Partial<PageConfig> = {
        title: 'PaulJS Page',
        description: 'Built with PaulJS',
        styles: '',
        scripts: '',
        sections: []
      };

      this.clearComponentCache();

      const processedSections = await Promise.all(
        config.sections.map(section => {
          const component = section.component.render(section.props || {});
          return {
            component,
            layout: section.layout
          };
        })
      );

      const pageData: ProcessedPageConfig = {
        ...defaultConfig,
        ...config,
        sections: processedSections
      };

      this.pages.set(route, pageData);
      
      this.app.get(route, (req, res) => {
        const freshPageData = {
          ...pageData,
          sections: processedSections
        };
        res.render('default', freshPageData);
      });

      return route;
    } catch (error) {
      throw new Error(`Failed to create page ${route}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async exportStaticSite(outputDir = 'dist'): Promise<string> {
    try {
      await fs.mkdir(outputDir, { recursive: true });
      
      for (const [route, pageData] of this.pages) {
        const templatePath = path.join(__dirname, 'templates', 'default.ejs');
        const template = await fs.readFile(templatePath, 'utf-8');
        const html = ejs.render(template, pageData);
        
        const outputPath = path.join(
          process.cwd(), 
          outputDir, 
          route === '/' ? 'index.html' : `${route.slice(1)}.html`
        );
        
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, html);
      }

      return outputDir;
    } catch (error) {
      throw new Error(`Error exporting static site: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  start(port = 3000): Promise<Server> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(port, () => {
          console.log(`🚀 PaulJS server running at http://localhost:${port}`);
          resolve(this.server as Server);
        });
      } catch (error) {
        reject(new Error(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
    }
  }

  registerComponent(name: string, component: Component): void {
    this.core.registerComponent(name, component);
  }

  clearComponentCache(): void {
    this.core.clearCache();
  }

  getComponents(): Map<string, Component> {
    return this.core.getComponents();
  }
}

const pauljs = new PaulJS();

export const createApp = () => pauljs;

export const adapters = {
  react: await import('./adapters/react.mts')
}; 