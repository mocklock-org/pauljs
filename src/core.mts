import { validateComponent } from './utils/validation.mts';
import type { Component, ComponentMap } from './types.mts';

export class PaulJSCore {
  private components: ComponentMap = new Map();
  private customComponents: ComponentMap = new Map();

  registerComponent(name: string, component: Component): void {
    try {
      validateComponent(component);
      this.customComponents.set(name, component);
    } catch (error) {
      throw new Error(`Failed to register component ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getComponent(name: string): Component {
    if (this.customComponents.has(name)) {
      return this.customComponents.get(name)!;
    }
    if (!this.components.has(name)) {
      throw new Error(`Component ${name} not found`);
    }
    return this.components.get(name)!;
  }

  clearCache(): void {
    this.customComponents.clear();
    this.components.clear();
  }

  getComponents(): ComponentMap {
    return new Map([...this.components, ...this.customComponents]);
  }
} 