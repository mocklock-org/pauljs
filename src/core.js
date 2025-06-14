const path = require('path');
const { validateComponent } = require('./utils/validation');

class PaulJSCore {
  constructor() {
    this.components = new Map();
    this.templates = new Map();
    this.customComponents = new Map();
  }

  registerComponent(name, component) {
    try {
      validateComponent(component);
      this.customComponents.set(name, component);
    } catch (error) {
      throw new Error(`Failed to register component ${name}: ${error.message}`);
    }
  }

  getComponent(name) {
    if (this.customComponents.has(name)) {
      return this.customComponents.get(name);
    }
    if (!this.components.has(name)) {
      throw new Error(`Component ${name} not found`);
    }
    return this.components.get(name);
  }

  loadBuiltInComponents() {
    try {
      const hero = require('./components/hero');
      const cta = require('./components/cta');
      const footer = require('./components/footer');

      this.components.set('hero', hero);
      this.components.set('cta', cta);
      this.components.set('footer', footer);
    } catch (error) {
      throw new Error(`Failed to load built-in components: ${error.message}`);
    }
  }

  clearCache() {
    this.customComponents.clear();
  }
}

module.exports = PaulJSCore; 