'use strict';

const Prism = require('prismjs');
const prismLoadLanguages = require('prismjs/components/');

const escapeHTML = require('./escape_html');
const unescapeHTML = require('./unescape_html');

/**
 * Wrapper of Prism.highlight()
 * @param {String} code
 * @param {String} language
 */
function prismHighlight(code, language) {
  // Prism has not load the language pattern
  if (!Prism.languages[language]) prismLoadLanguages(language);

  if (Prism.languages[language]) {
    // Prism escapes output by default
    return Prism.highlight(unescapeHTML(code), Prism.languages[language], language);
  }

  // Current language is not supported by Prism, return origin code;
  return escapeHTML(code);
}

/**
 * Generate line number required HTML snippet
 * @param {String} code - Highlighted code
 */
function lineNumberUtil(code) {
  const matched = code.match(/\n(?!$)/g);
  const num = matched ? matched.length + 1 : 1;
  const lines = new Array(num + 1);

  return `<span aria-hidden="true" class="line-numbers-rows">${lines.join('<span></span>')}</span>`;
}

function PrismUtil(str, options = {}) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  const {
    lineNumber = true,
    language
  } = options;

  const preTagClassArr = [];

  if (lineNumber) preTagClassArr.push('line-numbers');
  preTagClassArr.push(`language-${language}`);

  const startTag = `<pre class="${preTagClassArr.join(' ')}"><code class="language-${language}">`;
  const endTag = '</code></pre>';

  const highlightedCode = prismHighlight(str, language);

  if (lineNumber) {
    return startTag + highlightedCode + lineNumberUtil(highlightedCode) + endTag;
  }

  return startTag + highlightedCode + endTag;
}

module.exports = PrismUtil;
