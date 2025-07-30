import { createRequire } from 'module';
import { default as highlightUtil } from './highlight_shared.js';

// For ESM environments
global._require = createRequire(import.meta.url);

// ESM compatibility
export default highlightUtil;
// CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = highlightUtil;
  // For ESM compatibility
  module.exports.default = highlightUtil;
}
