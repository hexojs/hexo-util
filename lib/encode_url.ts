'use strict';

import {parse, format} from 'url';
import {unescape} from 'querystring';

const encodeURL = str => {
  if (parse(str).protocol) {
    const parsed = new URL(str);

    // Exit if input is a data url
    if (parsed.origin === 'null') return str;

    parsed.search = encodeURI(unescape(parsed.search));
    // preserve IDN
    return format(parsed, { unicode: true });
  }

  return encodeURI(unescape(str));
};

export default encodeURL;
