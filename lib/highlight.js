'use strict';

const hljs = require('highlight.js');
const stripIndent = require('strip-indent');
const alias = require('../highlight_alias.json');

function highlightUtil(str, options = {}) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');
  str = stripIndent(str);

  const useHljs = Object.prototype.hasOwnProperty.call(options, 'hljs') ? options.hljs : false;
  const {
    gutter = true,
    firstLine = 1,
    caption,
    mark = [],
    tab
  } = options;
  let { wrap = true } = options;

  hljs.configure({ classPrefix: useHljs ? 'hljs-' : ''});

  const data = highlight(str, options);
  const lang = options.lang || data.language || '';
  const classNames = (useHljs ? 'hljs' : 'highlight') + (lang ? ` ${lang}` : '');

  if (gutter && !wrap) wrap = true; // arbitrate conflict ("gutter:true" takes priority over "wrap:false")

  const before = useHljs ? `<pre><code class="${classNames}">` : '<pre>';
  const after = useHljs ? '</code></pre>' : '</pre>';


  const lines = data.value.split('\n');
  let numbers = '';
  let content = '';

  for (let i = 0, len = lines.length; i < len; i++) {
    let line = lines[i];
    if (tab) line = replaceTabs(line, tab);
    numbers += `<span class="line">${Number(firstLine) + i}</span><br>`;
    content += formatLine(line, Number(firstLine) + i, mark, options, wrap);
  }

  let codeCaption = '';

  if (caption) {
    codeCaption = wrap ? `<figcaption>${caption}</figcaption>` : `<div class="caption">${caption}</div>`;
  }

  if (!wrap) {
    // if original content has one trailing newline, replace it only once, else remove all trailing newlines
    content = /\r?\n$/.test(data.value) ? content.replace(/\n$/, '') : content.trimEnd();
    return `<pre>${codeCaption}<code class="${classNames}">${content}</code></pre>`;
  }

  let result = `<figure class="highlight${data.language ? ` ${data.language}` : ''}">`;

  result += codeCaption;

  result += '<table><tr>';

  if (gutter) {
    result += `<td class="gutter"><pre>${numbers}</pre></td>`;
  }

  result += `<td class="code">${before}${content}${after}</td>`;
  result += '</tr></table></figure>';

  return result;
}

function formatLine(line, lineno, marked, options, wrap) {
  const useHljs = (options.hljs || false) || !wrap;
  const br = wrap ? '<br>' : '\n';
  let res = useHljs ? '' : '<span class="line';
  if (marked.includes(lineno)) {
    // Handle marked lines.
    res += useHljs ? `<mark>${line}</mark>` : ` marked">${line}</span>`;
  } else {
    res += useHljs ? line : `">${line}</span>`;
  }

  res += br;
  return res;
}

function replaceTabs(str, tab) {
  return str.replace(/^\t+/, match => {
    let result = '';

    for (let i = 0, len = match.length; i < len; i++) {
      result += tab;
    }

    return result;
  });
}

function highlight(str, options) {
  let { lang } = options;
  const { autoDetect = false } = options;

  if (lang) {
    lang = lang.toLowerCase();
  } else if (autoDetect) {
    const result = hljs.highlightAuto(str);
    return closeTags(result);
  }

  if (!lang || !alias.aliases[lang]) {
    lang = 'plaintext';
  }

  const res = hljs.highlight(str, {
    language: lang,
    ignoreIllegals: true
  });

  return closeTags(res);
}

// https://github.com/hexojs/hexo-util/issues/10
function closeTags(res) {
  const tokenStack = [];

  res.value = res.value.split('\n').map(line => {
    const prepend = tokenStack.map(token => `<span class="${token}">`).join('');
    const matches = line.matchAll(/(<span class="(.*?)">|<\/span>)/g);
    for (const match of matches) {
      if (match[0] === '</span>') tokenStack.shift();
      else tokenStack.unshift(match[2]);
    }
    const append = '</span>'.repeat(tokenStack.length);
    return prepend + line + append;
  }).join('\n');
  return res;
}

module.exports = highlightUtil;
