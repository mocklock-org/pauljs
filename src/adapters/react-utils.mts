import * as babel from '@babel/core';

export function transformJSXToReact(code: string): string {
  const babelOptions = {
    presets: [
      ['@babel/preset-react', {
        runtime: 'automatic',
        development: process.env.NODE_ENV !== 'production'
      }]
    ],
    plugins: [
      '@babel/plugin-syntax-jsx',
      '@babel/plugin-transform-react-jsx'
    ]
  };

  try {
    const result = babel.transformSync(code, babelOptions);
    if (!result || !result.code) {
      throw new Error('Failed to transform JSX');
    }
    return result.code;
  } catch (error) {
    throw new Error(`Failed to transform JSX: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function extractStylesFromComponent(component: string): string {
  const styleRegex = /<style[^>]*>{([^}]+)}<\/style>/;
  const match = component.match(styleRegex);
  return match ? match[1].trim() : '';
}

export function createStyleObject(styles: string | null): Record<string, Record<string, string>> | null {
  if (!styles) return null;
  
  return styles
    .split('}')
    .filter(rule => rule.trim())
    .reduce((acc, rule) => {
      const [selector, ...declarations] = rule.split('{');
      const properties = declarations
        .join('{')
        .split(';')
        .filter(prop => prop.trim())
        .reduce((props, prop) => {
          const [key, value] = prop.split(':').map(s => s.trim());
          if (key && value) {
            // Convert kebab-case to camelCase
            const camelKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
            props[camelKey] = value;
          }
          return props;
        }, {} as Record<string, string>);
      
      acc[selector.trim()] = properties;
      return acc;
    }, {} as Record<string, Record<string, string>>);
}

export function generateUniqueClassName(componentName: string): string {
  return `pauljs-${componentName.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function wrapWithErrorBoundary(code: string): string {
  return `
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }

      componentDidCatch(error, errorInfo) {
        console.error('PaulJS Component Error:', error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          return (
            <div style={{ 
              padding: '1rem', 
              margin: '1rem', 
              border: '1px solid #ff0000',
              borderRadius: '4px',
              backgroundColor: '#fff5f5'
            }}>
              <h3 style={{ color: '#ff0000', margin: '0 0 0.5rem' }}>
                Component Error
              </h3>
              <pre style={{ margin: 0 }}>
                {this.state.error?.message}
              </pre>
            </div>
          );
        }
        return this.props.children;
      }
    }

    ${code}
  `;
} 