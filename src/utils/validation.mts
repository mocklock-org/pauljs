import type { Component } from '../types.mts';

export function validateComponent(component: Component): boolean {
  if (typeof component.render !== 'function') {
    throw new Error('Component must have a render method');
  }

  if (!component.defaultProps || typeof component.defaultProps !== 'object') {
    throw new Error('Component must have defaultProps object');
  }

  if (component.react && typeof component.react !== 'function') {
    throw new Error('React adapter must be a function if provided');
  }

  return true;
}

export function validateTemplate(template: string): boolean {
  if (typeof template !== 'string') {
    throw new Error('Template must be a string');
  }

  const hasValidSyntax = template.includes('<%') && template.includes('%>');
  if (!hasValidSyntax) {
    throw new Error('Template must contain valid EJS syntax');
  }

  return true;
} 