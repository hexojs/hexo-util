function escapeRegExp(str: string) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  // http://stackoverflow.com/a/6969486
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}


// For ESM compatibility
export default escapeRegExp;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = escapeRegExp;
  // For ESM compatibility
  module.exports.default = escapeRegExp;
}
