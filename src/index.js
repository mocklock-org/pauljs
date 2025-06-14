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
        hero: this.core.getComponent('hero').render(options.hero || {}),
        cta: this.core.getComponent('cta').render(options.cta || {}),
        footer: this.core.getComponent('footer').render(options.footer || {})
      };

      this.pages.set(route, pageData);
      
      this.app.get(route, (req, res) => {
        const freshPageData = {
          ...pageData,
          hero: this.core.getComponent('hero').render(options.hero || {}),
          cta: this.core.getComponent('cta').render(options.cta || {}),
          footer: this.core.getComponent('footer').render(options.footer || {})
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
}

// Factory function to create components with dynamic updates
const componentFactory = (Component, core) => {
  return (props = {}) => {
    try {
      // Get the latest version of the component
      const latestComponent = core.getComponent(Component.name);
      return latestComponent.render(props);
    } catch (error) {
      throw new Error(`Component render failed: ${error.message}`);
    }
  };
};

const core = new PaulJSCore();
core.loadBuiltInComponents();

module.exports = {
  createApp: () => new PaulJS(),
  components: Array.from(core.components.entries()).reduce((acc, [key, component]) => {
    acc[key] = componentFactory(component, core);
    return acc;
  }, {}),
  adapters: {
    react: require('./adapters/react')
  }
}; 