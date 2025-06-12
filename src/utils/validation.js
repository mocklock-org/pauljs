function validateComponent(component) {
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

function validateTemplate(template) {
  if (typeof template !== 'string') {
    throw new Error('Template must be a string');
  }

  const hasValidSyntax = template.includes('<%') && template.includes('%>');
  if (!hasValidSyntax) {
    throw new Error('Template must contain valid EJS syntax');
  }

  return true;
}

module.exports = {
  validateComponent,
  validateTemplate
}; 