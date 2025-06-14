const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

const config = {
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

module.exports = {
  isDevelopment,
  buildConfig: config[isDevelopment ? 'development' : 'production'],
  paths: {
    dist: path.join(__dirname, '..', 'dist'),
    src: path.join(__dirname, '..', 'src'),
    templates: path.join(__dirname, '..', 'src', 'templates'),
    sourceMaps: path.join(__dirname, '..', 'dist', 'sourcemaps')
  }
}; 