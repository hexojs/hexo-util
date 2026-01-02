// eslint-disable-next-line n/no-deprecated-api
import { parse, format } from 'url';
import { unescape } from 'querystring';

const decodeURL = (str: string) => {
  const index = str.indexOf(':');
  if (index < 0) {
    return unescape(str);
  }
  if (parse(str.slice(0, index + 1)).protocol) {
    const parsed = new URL(str);

    // Exit if input is a data url
    if (parsed.origin === 'null') return str;

    const url = format(parsed, { unicode: true });
    return unescape(url);
  }

  return unescape(str);
};

export = decodeURL;
