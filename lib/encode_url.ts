import { punycode } from './_punycode.js';

function safeDecodeURIComponent(str: string) {
  try {
    return decodeURI(str);
  } catch {
    return str;
  }
}

export const encodeURL = (str: string) => {
  // Handle data URLs
  if (/^data:/i.test(str)) return str;

  // Try absolute URL
  try {
    const url = new URL(str);
    // Convert punycode host to Unicode if needed
    const unicodeHost = punycode.toUnicode(url.hostname);
    // Encode pathname only if not already encoded
    const pathname = encodeURI(safeDecodeURIComponent(url.pathname));
    // Encode search params, preserving existing encodings
    const search = new URLSearchParams(url.search).toString() ? '?' + new URLSearchParams(url.search).toString() : '';
    // Encode hash
    const hash = url.hash ? '#' + encodeURI(safeDecodeURIComponent(url.hash.slice(1))) : '';
    // Rebuild URL string manually to preserve Unicode hostname
    let result = url.protocol + '//';
    if (url.username || url.password) {
      result += url.username;
      if (url.password) result += ':' + url.password;
      result += '@';
    }
    result += unicodeHost;
    if (url.port) result += ':' + url.port;
    result += pathname + search + hash;
    // Remove trailing slash for file URLs if not present in input
    if (/^file:/i.test(str) && !/\/$/.test(str)) {
      result = result.replace(/\/$/, '');
    }
    return result;
  } catch {
    // Not an absolute URL, try relative path or fragment
    // Handle hash only
    if (str.startsWith('#')) {
      return '#' + encodeURI(safeDecodeURIComponent(str.slice(1)));
    }
    // Handle relative path with query/hash
    const [path, search = ''] = str.split('?');
    const [pathname, hash = ''] = search.split('#');
    let encoded = encodeURI(safeDecodeURIComponent(path));
    if (pathname) {
      encoded += '?' + encodeURI(safeDecodeURIComponent(pathname));
    }
    if (hash) {
      encoded += '#' + encodeURI(safeDecodeURIComponent(hash));
    }
    return encoded;
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
