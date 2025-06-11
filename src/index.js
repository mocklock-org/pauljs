const fs = require('fs').promises;
const path = require('path');
const ejs = require('ejs');

// Import components
const hero = require('./components/hero');
const cta = require('./components/cta');
const footer = require('./components/footer');

// Import adapters
const reactAdapter = require('./adapters/react');

const components = {
  hero,
  cta,
  footer
};

async function generatePage(templateName = 'default', options = {}) {
  try {
    // Read template
    const templatePath = path.join(__dirname, 'templates', `${templateName}.ejs`);
    const template = await fs.readFile(templatePath, 'utf-8');

    // Default data
    const data = {
      title: 'PaulJS Landing Page',
      description: 'A beautiful landing page built with PaulJS',
      styles: '',
      scripts: '',
      ...options,
      // Render components
      hero: components.hero.render(options.hero || {}),
      cta: components.cta.render(options.cta || {}),
      footer: components.footer.render(options.footer || {})
    };

    // Render template
    const html = ejs.render(template, data);

    // Write output
    const outputPath = path.join(process.cwd(), 'index.html');
    await fs.writeFile(outputPath, html);

    return outputPath;
  } catch (error) {
    throw new Error(`Error generating page: ${error.message}`);
  }
}

async function addComponent(componentName, outputDir = '.') {
  try {
    if (!components[componentName]) {
      throw new Error(`Component "${componentName}" not found`);
    }

    const component = components[componentName];
    const html = component.render();
    
    const outputPath = path.join(process.cwd(), outputDir, `${componentName}.html`);
    await fs.writeFile(outputPath, html);

    return outputPath;
  } catch (error) {
    throw new Error(`Error adding component: ${error.message}`);
  }
}

// Export the public API
module.exports = {
  generatePage,
  addComponent,
  components,
  adapters: {
    react: reactAdapter
  }
}; 