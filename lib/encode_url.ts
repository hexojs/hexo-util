import { unescape } from 'querystring';
export const encodeURL = (str: string) => {
  try {
    const parsed = new URL(str);
    // Exit if input is a data url
    if (parsed.origin === 'null') return str;
    parsed.search = new URLSearchParams(parsed.search).toString();
    parsed.pathname = encodeURI(decodeURI(parsed.pathname));
    // preserve IDN
    return parsed.toString();
  } catch {
    return encodeURI(unescape(str));
  }
};


// For ESM compatibility
export default encodeURL;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = encodeURL;
  // For ESM compatibility
  module.exports.default = encodeURL;
}
