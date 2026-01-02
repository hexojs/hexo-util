// eslint-disable-next-line n/no-deprecated-api
import { parse, format } from 'url';
import { unescape } from 'querystring';

const encodeURL = (str: string) => {
  const index = str.indexOf(':');
  if (index < 0) {
    return encodeURI(unescape(str));
  }
  if (parse(str.slice(0, index + 1)).protocol) {
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
