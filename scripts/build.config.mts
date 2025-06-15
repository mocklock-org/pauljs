import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const isDevelopment = process.env.NODE_ENV !== 'production';

interface BabelConfig {
  sourceMaps: boolean;
  comments: boolean;
  compact: boolean;
}

interface TerserConfig {
  compress: boolean | {
    dead_code: boolean;
    drop_console: boolean;
    drop_debugger: boolean;
    pure_funcs: string[];
  };
  mangle: boolean;
  output: {
    comments: boolean;
    beautify?: boolean;
  };
}

interface BuildConfig {
  sourceMaps: boolean | 'external';
  minify: boolean;
  babel: BabelConfig;
  terser: TerserConfig;
}

const config: Record<'development' | 'production', BuildConfig> = {
  development: {
    sourceMaps: true,
    minify: false,
    babel: {
      sourceMaps: true,
      comments: true,
      compact: false
    },
    terser: {
      compress: false,
      mangle: false,
      output: {
        comments: true,
        beautify: true
      }
    }
  },
  production: {
    sourceMaps: 'external',
    minify: true,
    babel: {
      sourceMaps: true,
      comments: false,
      compact: true
    },
    terser: {
      compress: {
        dead_code: true,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: true,
      output: {
        comments: false
      }
    }
  }
};

export const buildConfig = config[isDevelopment ? 'development' : 'production'];

export const paths = {
  dist: path.join(__dirname, '..', 'dist'),
  src: path.join(__dirname, '..', 'src'),
  templates: path.join(__dirname, '..', 'src', 'templates'),
  sourceMaps: path.join(__dirname, '..', 'dist', 'sourcemaps')
};