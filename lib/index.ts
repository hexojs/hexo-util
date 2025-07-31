import * as utilities from './index-exports.js';
export * from './index-exports.js';
export default utilities;

// CommonJS module export for compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = utilities;
  // For TypeScript compatibility, ensure the default export is also available
  module.exports.default = utilities;
}
