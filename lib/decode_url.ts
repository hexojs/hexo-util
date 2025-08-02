import { punycode } from './_punycode.js';

function safeDecodeURIComponent(str: string) {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

export const decodeURL = (str: string) => {
  // Handle data URLs
  if (/^data:/i.test(str)) return str;

  // Try absolute URL
  try {
    const url = new URL(str);
    // Convert punycode host to Unicode if needed
    const unicodeHost = punycode.toUnicode(url.hostname);
    // Decode pathname only if not already decoded
    const pathname = safeDecodeURIComponent(url.pathname);
    // Decode search params
    let search = '';
    if (url.search) {
      const params = new URLSearchParams(url.search);
      const decodedParams = [];
      for (const [key, value] of params.entries()) {
        decodedParams.push(`${safeDecodeURIComponent(key)}=${safeDecodeURIComponent(value)}`);
      }
      search = decodedParams.length ? '?' + decodedParams.join('&') : '';
    }
    // Decode hash
    const hash = url.hash ? '#' + safeDecodeURIComponent(url.hash.slice(1)) : '';
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
      return '#' + safeDecodeURIComponent(str.slice(1));
    }
    // Handle relative path with query/hash
    const [path, search = ''] = str.split('?');
    const [pathname, hash = ''] = search.split('#');
    let decoded = safeDecodeURIComponent(path);
    if (pathname) {
      decoded += '?' + safeDecodeURIComponent(pathname);
    }
    if (hash) {
      decoded += '#' + safeDecodeURIComponent(hash);
    }
    return decoded;
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
