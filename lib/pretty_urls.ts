'use strict';

interface Options {
  trailing_index?: boolean,
  trailing_html?: boolean
}

function prettyUrls(url, options: Options = {}) {
  options = Object.assign({
    trailing_index: true,
    trailing_html: true
  }, options);

  const indexPattern = /index\.html$/;
  if (options.trailing_index === false) url = url.replace(indexPattern, '');
  if (options.trailing_html === false && !indexPattern.test(url)) {
    url = url.replace(/\.html$/, '');
  }

  return url;
}

export default prettyUrls;
