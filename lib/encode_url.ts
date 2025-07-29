import { parse, format } from 'url';
import { unescape } from 'querystring';

export const encodeURL = (str: string) => {
  if (parse(str).protocol) {
    const parsed = new URL(str);

    // Exit if input is a data url
    if (parsed.origin === 'null') return str;

    parsed.search = new URLSearchParams(parsed.search).toString();
    parsed.pathname = encodeURI(decodeURI(parsed.pathname));
    // preserve IDN
    return format(parsed, { unicode: true });
  }

  return encodeURI(unescape(str));
};


// For ESM compatibility
export default encodeURL;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = encodeURL;
  // For ESM compatibility
  module.exports.default = encodeURL;
}
