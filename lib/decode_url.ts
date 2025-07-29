import { unescape } from 'querystring';

export const decodeURL = (str: string) => {
  try {
    const parsed = new URL(str);
    // Exit if input is a data url
    if (parsed.origin === 'null') return str;
    // Use href to get the full URL string
    return unescape(parsed.href);
  } catch (e) {
    // If it's not a valid URL, just unescape the string
    return unescape(str);
  }
};

// For ESM compatibility
export default decodeURL;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = decodeURL;
  // For ESM compatibility
  module.exports.default = decodeURL;
}
