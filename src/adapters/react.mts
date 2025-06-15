import {
  functionComponentTemplate,
  memoComponentTemplate,
  forwardRefComponentTemplate
} from './react-templates.mts';

import {
  transformJSXToReact,
  extractStylesFromComponent,
  createStyleObject,
  generateUniqueClassName,
  wrapWithErrorBoundary
} from './react-utils.mts';

import { createRequire } from 'module';
import vm from 'vm';

interface PaulComponent {
  name?: string;
  react: (defaultProps: Record<string, any>) => {
    component: (props: Record<string, any>) => string;
  };
}

interface ConversionOptions {
  memo?: boolean;
  forwardRef?: boolean;
  errorBoundary?: boolean;
  defaultProps?: Record<string, any>;
}

/**
 * Converts a PaulJS component to a React component
 * @param paulComponent - The PaulJS component to convert
 * @param options - Conversion options
 * @returns The converted React component code
 */
export function convertToReactComponent(paulComponent: PaulComponent, options: ConversionOptions = {}): string {
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
    throw new Error(`Failed to convert component: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a React component from a PaulJS component with hooks support
 * @param paulComponent - The PaulJS component
 * @param options - Component options
 * @returns A React component
 */
export function createReactComponent(paulComponent: PaulComponent, options: ConversionOptions = {}): any {
  const code = convertToReactComponent(paulComponent, options);
  
  // Create a new module context
  const module = { exports: {} };
  const require = createRequire(import.meta.url);

  // Create a secure context for evaluation
  const context = vm.createContext({
    module,
    require,
    console,
    process
  });

  // Evaluate the component code in the secure context
  try {
    vm.runInContext(code, context);
    return module.exports;
  } catch (error) {
    throw new Error(`Failed to create component: ${error instanceof Error ? error.message : String(error)}`);
  }
} 