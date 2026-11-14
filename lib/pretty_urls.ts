interface Options {
  trailing_index?: boolean,
  trailing_html?: boolean
}

function prettyUrls(url: string, options: Options = {}) {
  const opaqueUrl = /^[a-z][a-z\d+.-]*:(?!\/)/i;
  const authorityOnly = /^(?:[a-z][a-z\d+.-]*:)?\/\/[^/]*$/i;
  if (/[?#]/.test(url) || opaqueUrl.test(url) || authorityOnly.test(url)) return url;

  options = Object.assign({
    trailing_index: true,
    trailing_html: true
  }, options);

  const indexPattern = /(^|\/)index\.html$/;
  if (options.trailing_index === false) url = url.replace(indexPattern, '$1');
  if (options.trailing_html === false && !indexPattern.test(url)) {
    url = url.replace(/\.html$/, '');
  }

  return url;
}

export = prettyUrls;
