'use strict';

const Prism = require('prismjs');
const prismLoadLanguages = require('prismjs/components/');

// https://github.com/PrismJS/prism/issues/2145
const prismComponents = require('prismjs/components.json');
const prismSupportedLanguages = Object.keys(prismComponents.languages);

const escapeHTML = require('./escape_html');
const unescapeHTML = require('./unescape_html');

/**
 * Wrapper of Prism.highlight()
 * @param {String} code
 * @param {String} language
 */
function prismHighlight(code, language) {
  // Current language is not supported by Prism, return origin code;
  if (!prismSupportedLanguages.includes(language)) return escapeHTML(code);

  // Prism has not load the language pattern
  if (!Prism.languages[language]) prismLoadLanguages(language);

  if (Prism.languages[language]) {
    // Prism escapes output by default
    return Prism.highlight(unescapeHTML(code), Prism.languages[language], language);
  }

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

function replaceTabs(str, tab) {
  return str.replace(/^\t+/gm, match => {
    let result = '';

    for (let i = 0, len = match.length; i < len; i++) {
      result += tab;
    }

    return result;
  });
}

function PrismUtil(str, options = {}) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  const {
    lineNumber = true,
    language = 'plain',
    tab
  } = options;

  const preTagClassArr = [];

  if (lineNumber) preTagClassArr.push('line-numbers');
  preTagClassArr.push(`language-${language}`);

  if (tab) str = replaceTabs(str, tab);

  const startTag = `<pre class="${preTagClassArr.join(' ')}"><code class="language-${language}">`;
  const endTag = '</code></pre>';

  let parsedCode = '';
  if (language === 'plain') {
    parsedCode = escapeHTML(str);
  } else {
    parsedCode = prismHighlight(str, language);
  }

  if (lineNumber) {
    parsedCode += lineNumberUtil(parsedCode);
  }

  return startTag + parsedCode + endTag;
}

module.exports = PrismUtil;
