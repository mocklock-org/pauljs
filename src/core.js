const path = require('path');
const { validateComponent } = require('./utils/validation');

class PaulJSCore {
  constructor() {
    this.components = new Map();
    this.templates = new Map();
  }

  registerComponent(name, component) {
    try {
      validateComponent(component);
      this.components.set(name, component);
    } catch (error) {
      throw new Error(`Failed to register component ${name}: ${error.message}`);
    }
  }

  getComponent(name) {
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

      this.registerComponent('hero', hero);
      this.registerComponent('cta', cta);
      this.registerComponent('footer', footer);
    } catch (error) {
      throw new Error(`Failed to load built-in components: ${error.message}`);
    }
  }
}

module.exports = PaulJSCore; 