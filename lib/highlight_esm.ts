import type { HLJSApi, HighlightResult } from 'highlight.js';
import _highlight from 'highlight.js/lib/core';
import stripIndent from 'strip-indent';
import alias from './highlight_alias.js';
import { InternalHighlightOptions } from './types.js';
import { createRequire } from 'module';

let hljs: HLJSApi | undefined;
// ESM: Always use createRequire(import.meta.url)
const _require = createRequire(import.meta.url);

function highlightUtil(str: string, options: InternalHighlightOptions = {}) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  const useHljs = Object.prototype.hasOwnProperty.call(options, 'hljs') ? options.hljs : false;
  const {
    gutter = true,
    firstLine = 1,
    caption,
    mark = [],
    languageAttr = false,
    tab,
    stripIndent: enableStripIndent = true
  } = options;
  let { wrap = true } = options;

  if (enableStripIndent) {
    str = stripIndent(str);
  }

  if (!hljs) {
    hljs = _highlight;
  }
  hljs.configure({ classPrefix: useHljs ? 'hljs-' : '' });
  let lang = options.lang || options.language || 'plaintext';
  // Register the language if it hasn't been registered yet
  if (!hljs.getLanguage(lang)) {
    try {
      const mod = _require(`highlight.js/lib/languages/${alias.aliases[lang] || lang}`);
      hljs.registerLanguage(lang, mod.default || mod);
    } catch {
      // If the language module does not exist, skip registration
    }
  }

  const data = highlight(str, options);
  lang = options.lang || data.language || '';
  const classNames = (useHljs ? 'hljs' : 'highlight') + (lang ? ` ${lang}` : '');

  if (gutter && !wrap) wrap = true; // arbitrate conflict ("gutter:true" takes priority over "wrap:false")

  const before = useHljs ? `<pre><code class="${classNames}"${languageAttr && lang ? ` data-language="${lang}"` : ''}>` : '<pre>';
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
    return `<pre>${codeCaption}<code class="${classNames}"${languageAttr && lang ? ` data-language="${lang}"` : ''}>${content}</code></pre>`;
  }

  let result = `<figure class="highlight${data.language ? ` ${data.language}` : ''}"${languageAttr && lang ? ` data-language="${lang}"` : ''}>`;

  result += codeCaption;

  result += '<table><tr>';

  if (gutter) {
    result += `<td class="gutter"><pre>${numbers}</pre></td>`;
  }

  result += `<td class="code">${before}${content}${after}</td>`;
  result += '</tr></table></figure>';

  return result;
}

function formatLine(line: string, lineno: number, marked: number[], options: InternalHighlightOptions, wrap: boolean) {
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

function replaceTabs(str: string, tab: string) {
  return str.replace(/\t+/, match => tab.repeat(match.length));
}

function highlight(str: string, options: InternalHighlightOptions) {
  let { lang } = options;
  const { autoDetect = false } = options;

  if (!hljs) {
    hljs = _highlight;
  }

  if (lang) {
    lang = lang.toLowerCase();
  } else if (autoDetect) {
    const result = hljs.highlightAuto(str);
    return closeTags(result);
  }

  if (!lang || (!alias.aliases[lang] && !hljs.getLanguage(lang))) {
    lang = 'plaintext';
  }

  const res = hljs.highlight(str, {
    language: lang,
    ignoreIllegals: true
  });

  return closeTags(res);
}

// https://github.com/hexojs/hexo-util/issues/10
function closeTags(res: HighlightResult) {
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


// For ESM compatibility
export default highlightUtil;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = highlightUtil;
  // For ESM compatibility
  module.exports.default = highlightUtil;
}
