const {
  functionComponentTemplate,
  memoComponentTemplate,
  forwardRefComponentTemplate
} = require('./react-templates');

const {
  transformJSXToReact,
  extractStylesFromComponent,
  createStyleObject,
  generateUniqueClassName,
  wrapWithErrorBoundary
} = require('./react-utils');

/**
 * Converts a PaulJS component to a React component
 * @param {Object} paulComponent - The PaulJS component to convert
 * @param {Object} options - Conversion options
 * @param {boolean} options.memo - Whether to memoize the component
 * @param {boolean} options.forwardRef - Whether to forward refs
 * @param {boolean} options.errorBoundary - Whether to wrap with error boundary
 * @param {Object} options.defaultProps - Default props for the component
 * @returns {string} The converted React component code
 */
function convertToReactComponent(paulComponent, options = {}) {
  const {
    memo = false,
    forwardRef = false,
    errorBoundary = true,
    defaultProps = {}
  } = options;

  // Get the component name from the paulComponent or generate one
  const componentName = paulComponent.name || 'PaulJSComponent';
  
  // Generate a unique class name for scoped styles
  const uniqueClassName = generateUniqueClassName(componentName);

  // Get the component implementation from paulComponent
  const implementation = paulComponent.react(defaultProps);
  
  if (!implementation || typeof implementation.component !== 'function') {
    throw new Error('Invalid PaulJS component: missing react implementation');
  }

  // Extract the component code and styles
  const componentCode = implementation.component(defaultProps);
  const styles = extractStylesFromComponent(componentCode);
  const styleObject = createStyleObject(styles);

  // Create the component implementation
  let code = '';

  // Add style handling
  if (styleObject) {
    code += `
      const componentStyles = ${JSON.stringify(styleObject, null, 2)};
      const styleElement = document.createElement('style');
      styleElement.textContent = \`
        ${styles.replace(/pauljs-/g, uniqueClassName)}
      \`;
      document.head.appendChild(styleElement);
    `;
  }

  // Add the component implementation
  code += `
    ${componentCode.replace(/pauljs-/g, uniqueClassName)}
  `;

  // Choose the appropriate template
  let template = functionComponentTemplate;
  if (forwardRef) {
    template = forwardRefComponentTemplate;
  } else if (memo) {
    template = memoComponentTemplate;
  }

  // Replace template placeholders
  let finalCode = template
    .replace(/COMPONENT_NAME/g, componentName)
    .replace(/DISPLAY_NAME/g, `PaulJS.${componentName}`)
    .replace(/COMPONENT_IMPLEMENTATION/g, code)
    .replace(/RENDER_METHOD/g, 'render');

  // Add error boundary if requested
  if (errorBoundary) {
    finalCode = wrapWithErrorBoundary(finalCode);
  }

  // Transform the code with Babel
  try {
    return transformJSXToReact(finalCode);
  } catch (error) {
    throw new Error(`Failed to convert component: ${error.message}`);
  }
}

/**
 * Creates a React component from a PaulJS component with hooks support
 * @param {Object} paulComponent - The PaulJS component
 * @param {Object} options - Component options
 * @returns {Function} A React component
 */
function createReactComponent(paulComponent, options = {}) {
  const code = convertToReactComponent(paulComponent, options);
  
  // Create a new module to evaluate the component
  const module = { exports: {} };
  const require = (moduleName) => {
    if (moduleName === 'react') return require('react');
    throw new Error(`Module ${moduleName} not found`);
  };

  // Evaluate the component code
  try {
    new Function('module', 'require', code)(module, require);
    return module.exports;
  } catch (error) {
    throw new Error(`Failed to create component: ${error.message}`);
  }
}

module.exports = {
  convertToReactComponent,
  createReactComponent
}; 