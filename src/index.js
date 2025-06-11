const fs = require('fs').promises;
const path = require('path');
const ejs = require('ejs');
const express = require('express');

const hero = require('./components/hero');
const cta = require('./components/cta');
const footer = require('./components/footer');

const reactAdapter = require('./adapters/react');

const components = {
  hero,
  cta,
  footer
};

class PaulJS {
  constructor() {
    this.app = express();
    this.pages = new Map();
    this.setupMiddleware();
  }

  setupMiddleware() {
    this.app.use(express.static('public'));
    this.app.use(express.json());
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'templates'));
  }

  async createPage(route, options = {}) {
    const defaultOptions = {
      title: 'PaulJS Page',
      description: 'Built with PaulJS',
      styles: '',
      scripts: '',
      hero: {},
      cta: {},
      footer: {}
    };

    const pageData = Object.assign({}, defaultOptions, options, {
      hero: components.hero.render(options.hero || {}),
      cta: components.cta.render(options.cta || {}),
      footer: components.footer.render(options.footer || {})
    });

    this.pages.set(route, pageData);
    this.app.get(route, (req, res) => {
      res.render('default', pageData);
    });

    return route;
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
    return new Promise((resolve) => {
      this.server = this.app.listen(port, () => {
        console.log(`🚀 PaulJS server running at http://localhost:${port}`);
        resolve(this.server);
      });
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

const componentFactory = (Component) => {
  return (props = {}) => {
    return Component.render(props);
  };
};

module.exports = {
  createApp: () => new PaulJS(),
  components: Object.keys(components).reduce((acc, key) => {
    acc[key] = componentFactory(components[key]);
    return acc;
  }, {}),
  adapters: {
    react: reactAdapter
  }
}; 