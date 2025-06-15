// Handle CSS files by returning an empty object
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

require.extensions['.css'] = function (module: NodeModule, _filename: string): void {
  module.exports = {};
}; 