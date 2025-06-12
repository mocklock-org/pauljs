// Handle CSS files by returning an empty object
require.extensions['.css'] = function (module, filename) {
  module.exports = {};
}; 