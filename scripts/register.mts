import { createRequire } from 'module';
import type { TransformOptions } from '@babel/core';
import type { MatchPatternContext } from '@babel/core';

const require = createRequire(import.meta.url);

interface BabelRegisterOptions extends TransformOptions {
  extensions?: string[];
  cache?: boolean;
  only?: Array<(filename: string | undefined, context: MatchPatternContext) => boolean>;
}

type RegisterFunction = (options: BabelRegisterOptions) => void;

const babelRegister = require('@babel/register') as RegisterFunction;

babelRegister({
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: '14'
      }
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-transform-object-rest-spread',
    '@babel/plugin-transform-runtime'
  ],
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.mts', '.mjs'],
  cache: true,
  only: [
    function(filename: string | undefined, _context: MatchPatternContext): boolean {
      return filename ? (
        filename.includes(process.cwd()) && 
        !filename.includes('node_modules')
      ) : false;
    }
  ]
}); 