const fs = require('fs').promises;
const path = require('path');
const ejs = require('ejs');
const express = require('express');
const PaulJSCore = require('./core');

class PaulJS {
  constructor() {
    this.app = express();
    this.pages = new Map();
    this.core = new PaulJSCore();
    
    this.setupMiddleware();
    this.initializeCore();
  }

  async initializeCore() {
    try {
      this.core.loadBuiltInComponents();
    } catch (error) {
      throw new Error(`Failed to initialize PaulJS: ${error.message}`);
    }
  }

  setupMiddleware() {
    this.app.use(express.static('public'));
    this.app.use('/styles', express.static(path.join(process.cwd(), 'styles')));
    this.app.use(express.json());
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'templates'));
  }

  async createPage(route, options = {}) {
    try {
      const defaultOptions = {
        title: 'PaulJS Page',
        description: 'Built with PaulJS',
        styles: '',
        scripts: '',
        hero: {},
        cta: {},
        footer: {}
      };

      this.clearComponentCache();

      const pageData = {
        ...defaultOptions,
        ...options,
        hero: options.hero !== null && options.hero !== '' ? this.core.getComponent('hero').render(options.hero || {}) : '',
        cta: options.cta !== null && options.cta !== '' ? this.core.getComponent('cta').render(options.cta || {}) : '',
        footer: options.footer !== null && options.footer !== '' ? this.core.getComponent('footer').render(options.footer || {}) : ''
      };

      this.pages.set(route, pageData);
      
      this.app.get(route, (req, res) => {
        const freshPageData = {
          ...pageData,
          hero: options.hero !== null && options.hero !== '' ? this.core.getComponent('hero').render(options.hero || {}) : '',
          cta: options.cta !== null && options.cta !== '' ? this.core.getComponent('cta').render(options.cta || {}) : '',
          footer: options.footer !== null && options.footer !== '' ? this.core.getComponent('footer').render(options.footer || {}) : ''
        };
        res.render('default', freshPageData);
      });

      return route;
    } catch (error) {
      throw new Error(`Failed to create page ${route}: ${error.message}`);
    }
  }

  async exportStaticSite(outputDir = 'dist') {
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
        
        await fs.writeFile(outputPath, html);
      }

      return outputDir;
    } catch (error) {
      throw new Error(`Error exporting static site: ${error.message}`);
    }
  }

  start(port = 3000) {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(port, () => {
          console.log(`🚀 PaulJS server running at http://localhost:${port}`);
          resolve(this.server);
        });
      } catch (error) {
        reject(new Error(`Failed to start server: ${error.message}`));
      }
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }

  registerComponent(name, component) {
    this.core.registerComponent(name, component);
  }

  clearComponentCache() {
    this.core.clearCache();
  }

  getComponents() {
    return this.core.components;
  }
}

const componentFactory = (name, component, core) => {
  return (props = {}) => {
    try {
      if (!component || props === null || props === '') {
        return '';
      }
      
      const defaultProps = component.defaultProps || {};
      const mergedProps = { ...defaultProps, ...props };
      return component.render(mergedProps);
    } catch (error) {
      console.error(`Component ${name} render failed:`, error);
      return '';
    }
  };
};

const pauljs = new PaulJS();

module.exports = {
  createApp: () => pauljs,
  components: Array.from(pauljs.core.getComponents().entries()).reduce((acc, [name, component]) => {
    acc[name] = componentFactory(name, component, pauljs.core);
    return acc;
  }, {}),
  adapters: {
    react: require('./adapters/react')
  }
}; 