import { format } from 'url';
import { unescape } from 'querystring';

const decodeURL = (str: string) => {
  if (!str.includes(':')) {
    return unescape(str);
  }

  const parsed = URL.parse(str);
  if (parsed) {

    // Exit if input is a data url
    if (parsed.origin === 'null') return str;

    const url = format(parsed, { unicode: true });
    return unescape(url);
  }

  return unescape(str);
};

export = decodeURL;
