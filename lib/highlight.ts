import { default as highlightUtil } from './highlight_shared.js';

if (typeof require === 'function') {
  // For CommonJS environments
  global._require = require;
}

// ESM compatibility
export default highlightUtil;
// CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = highlightUtil;
  // For ESM compatibility
  module.exports.default = highlightUtil;
}
