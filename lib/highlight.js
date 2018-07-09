'use strict';

const hljs = require('highlight.js/lib/highlight');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const alias = require('../highlight_alias.json');

function highlightUtil(str, options = {}) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  const {
    gutter = true,
    caption,
    mark = [],
    tab,
    lang
  } = options;

  const useHljs = Object.prototype.hasOwnProperty.call(options, 'hljs') ? options.hljs : false;

  let { wrap = true, firstLine = 1 } = options;
  firstLine = Number(firstLine);

  hljs.configure({ classPrefix: useHljs ? 'hljs-' : ''});

  const { value, language } = highlight(str, options);

  if (useHljs && !gutter) wrap = false;

  const before = useHljs ? `<pre><code class="hljs ${lang}">` : '<pre>';
  const after = useHljs ? '</code></pre>' : '</pre>';

  if (!wrap) return useHljs ? before + value + after : value;

  const lines = value.split('\n');
  let numbers = '';
  let content = '';

  lines.forEach((line, i) => {
    if (tab) line = replaceTabs(line, tab);
    numbers += `<span class="line">${firstLine + i}</span><br>`;
    content += formatLine(line, firstLine + i, mark, options);
  });

  let result = `<figure class="highlight${language ? ` ${language}` : ''}">`;

  if (caption) {
    result += `<figcaption>${caption}</figcaption>`;
  }

  result += '<table><tr>';

  if (gutter) {
    result += `<td class="gutter"><pre>${numbers}</pre></td>`;
  }

  result += `<td class="code">${before}${content}${after}</td>`;
  result += '</tr></table></figure>';

  return result;
}

function formatLine(line, lineno, marked, options) {
  const { hljs: useHljs = false } = options;
  let res = useHljs ? '' : '<span class="line';
  if (marked.includes(lineno)) {
    // Handle marked lines.
    res += useHljs ? `<mark>${line}</mark>` : ` marked">${line}</span>`;
  } else {
    res += useHljs ? line : `">${line}</span>`;
  }

  res += '<br>';
  return res;
}

function encodePlainString(str) {
  return entities.encode(str);
}

function replaceTabs(str, tab) {
  return str.replace(/^\t+/, match => {
    const len = match.length;

    let result = '';

    for (let i = 0; i < len; i++) {
      result += tab;
    }

    return result;
  });
}

function loadLanguage(lang) {
  hljs.registerLanguage(lang, require(`highlight.js/lib/languages/${lang}`));
}

function tryLanguage(lang) {
  if (hljs.getLanguage(lang)) return true;
  if (!alias.aliases[lang]) return false;

  loadLanguage(alias.aliases[lang]);
  return true;
}

function loadAllLanguages() {
  alias.languages.filter(lang => !hljs.getLanguage(lang)).forEach(loadLanguage);
}

function highlight(str, options = {}) {
  let { lang } = options;
  const { autoDetect = false } = options;

  if (!lang && autoDetect) {
    loadAllLanguages();
    const autoResult = hljs.highlightAuto(str);
    if (autoResult.relevance > 0 && autoResult.language) {
      lang = autoResult.language;
    }
  }

  if (!lang) {
    lang = 'plain';
  }

  const result = {
    value: encodePlainString(str),
    language: lang.toLowerCase()
  };

  if (result.language === 'plain') {
    return result;
  }

  if (!tryLanguage(result.language)) {
    result.language = 'plain';
    return result;
  }

  if (options.hljs) return hljs.highlight(lang, str);

  return tryHighlight(str, result.language) || result;
}

function tryHighlight(str, lang) {
  try {
    const matching = str.match(/(\r?\n)/);
    const separator = matching ? matching[1] : '';
    const lines = matching ? str.split(separator) : [str];

    let result = hljs.highlight(lang, lines.shift());
    let html = result.value;

    while (lines.length > 0) {
      result = hljs.highlight(lang, lines.shift(), false, result.top);
      html += separator + result.value;
    }

    result.value = html;
    return result;
  } catch (err) {
    // Do Nothing
  }
}

module.exports = highlightUtil;
