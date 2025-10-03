import { format } from 'url';
import { unescape } from 'querystring';

const PROTOCOL_RE = /^[a-z0-9.+-]+:/i;

const hasProtocolLikeNode = (str: unknown): boolean => {
  if (typeof str !== 'string') throw new TypeError('url must be a string');
  return PROTOCOL_RE.test(str.trim());
};

const encodeURL = (str: string) => {
  if (hasProtocolLikeNode(str)) {
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

export = encodeURL;
