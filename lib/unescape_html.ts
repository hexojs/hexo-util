const htmlEntityMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': '\'',
  '&#96;': '`',
  '&#x2F;': '/',
  '&#x3D;': '='
};

const regexHtml = new RegExp(Object.keys(htmlEntityMap).join('|'), 'g');

const unescapeHTML = (str: string) => {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  return str.replace(regexHtml, a => htmlEntityMap[a]);
};


// For ESM compatibility
export default unescapeHTML;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = unescapeHTML;
  // For ESM compatibility
  module.exports.default = unescapeHTML;
}
