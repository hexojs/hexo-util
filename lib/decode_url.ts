import { parse, format } from 'url';
import { unescape } from 'querystring';

export const decodeURL = (str: string) => {
  if (parse(str).protocol) {
    const parsed = new URL(str);

    // Exit if input is a data url
    if (parsed.origin === 'null') return str;

    const url = format(parsed, { unicode: true });
    return unescape(url);
  }

  return unescape(str);
};


// For ESM compatibility
export default decodeURL;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = decodeURL;
  // For ESM compatibility
  module.exports.default = decodeURL;
}
