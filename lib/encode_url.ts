import { format } from 'url';
import { unescape } from 'querystring';

const encodeURL = (str: string) => {
  if (!str.includes(':')) {
    return encodeURI(unescape(str));
  }

  const parsed = URL.parse(str);
  if (parsed) {

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
