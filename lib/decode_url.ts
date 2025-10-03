import { format } from 'url';
import { unescape } from 'querystring';

const PROTOCOL_RE = /^[a-z0-9.+-]+:/i;

const hasProtocolLikeNode = (str: unknown): boolean => {
  if (typeof str !== 'string') throw new TypeError('url must be a string');
  return PROTOCOL_RE.test(str.trim());
};

const decodeURL = (str: string) => {
  if (hasProtocolLikeNode(str)) {
    const parsed = new URL(str);

    // Exit if input is a data url
    if (parsed.origin === 'null') return str;

    const url = format(parsed, { unicode: true });
    return unescape(url);
  }

  return unescape(str);
};

export = decodeURL;
