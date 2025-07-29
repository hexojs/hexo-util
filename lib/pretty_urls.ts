interface Options {
  trailing_index?: boolean,
  trailing_html?: boolean
}

function prettyUrls(url: string, options: Options = {}) {
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


// For ESM compatibility
export default prettyUrls;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = prettyUrls;
  // For ESM compatibility
  module.exports.default = prettyUrls;
}
