import stripIndent from 'strip-indent';

// For ESM compatibility
export default stripIndent;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = stripIndent;
  // For ESM compatibility
  module.exports.default = stripIndent;
}
