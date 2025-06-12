const path = require('path');

// Handle CSS files by returning an empty object
require.extensions['.css'] = function (module, filename) {
  module.exports = {};
};

require('@babel/register')({
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: '14'
      }
    }]
  ],
  plugins: [
    '@babel/plugin-transform-object-rest-spread',
    '@babel/plugin-transform-runtime'
  ],
  extensions: ['.js', '.jsx'],
  cache: true,
  only: [
    // Only transpile files in the user's project
    function(filepath) {
      return filepath.includes(process.cwd()) && 
             !filepath.includes('node_modules');
    }
  ]
}); 