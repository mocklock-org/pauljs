import { ComponentOptions, ComponentType } from './types.mts';
import * as path from 'path';
import * as fs from 'fs';
import * as babel from '@babel/core';
import * as typescript from 'typescript';
import * as vm from 'vm';

type Component = {
  (props: Record<string, unknown>): unknown;
} | string;

interface ModuleExports {
  exports: {
    default?: Component;
    [key: string]: Component | undefined;
  };
}

export class ComponentLoader {
  private cache: Map<string, Component> = new Map();
  
  constructor(private rootDir: string) {}

  async loadComponent(options: ComponentOptions): Promise<Component> {
    const cacheKey = `${options.path}:${JSON.stringify(options.props)}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (!cached) {
        throw new Error(`Component ${options.path} not found in cache`);
      }
      return cached;
    }

    const fullPath = path.resolve(this.rootDir, options.path);
    const content = await fs.promises.readFile(fullPath, 'utf-8');
    
    let processedContent = content;
    switch (this.getFileType(options.path)) {
      case 'tsx':
      case 'ts':
        processedContent = this.processTypeScript(content, options.path);
        break;
      case 'jsx':
        processedContent = this.processJSX(content);
        break;
      case 'html':
        processedContent = this.processHTML(content);
        break;
    }

    const component = this.evaluateComponent(processedContent, options);
    if (typeof component !== 'function' && typeof component !== 'string') {
      throw new Error(`Invalid component type for ${options.path}. Expected function or string, got ${typeof component}`);
    }
    
    this.cache.set(cacheKey, component);
    return component;
  }

  private getFileType(filePath: string): ComponentType {
    return path.extname(filePath).slice(1) as ComponentType;
  }

  private processTypeScript(content: string, filePath: string): string {
    const result = typescript.transpileModule(content, {
      compilerOptions: {
        jsx: typescript.JsxEmit.React,
        module: typescript.ModuleKind.ESNext,
        target: typescript.ScriptTarget.ES2018,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      },
      fileName: filePath
    });
    return result.outputText;
  }

  private processJSX(content: string): string {
    const result = babel.transformSync(content, {
      presets: ['@babel/preset-react'],
      plugins: [
        ['@babel/plugin-transform-modules-commonjs', { strict: true }]
      ]
    });
    return result?.code || '';
  }

  private processHTML(content: string): string {
    // Convert HTML to JSX
    return `
      export default function(props) {
        return React.createElement('div', {
          dangerouslySetInnerHTML: { __html: ${JSON.stringify(content)} }
        });
      }
    `;
  }

  private evaluateComponent(content: string, options: ComponentOptions): Component {
    const module: ModuleExports = { exports: {} };
    
    const require = (moduleName: string): Component => {
      if (moduleName === 'react') {
        // Mock React for now
        return function() { return {}; };
      }
      if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
        throw new Error('Synchronous local imports not supported');
      }
      throw new Error(`External module imports not supported: ${moduleName}`);
    };

    try {
      const context = { module, require };
      vm.runInNewContext(content, context);
      
      const component = module.exports.default || Object.values(module.exports)[0];
      if (!component || (typeof component !== 'function' && typeof component !== 'string')) {
        throw new Error(`Component must export a function or string, got ${typeof component}`);
      }
      return component;
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to evaluate component ${options.path}: ${err}`);
    }
  }
} 