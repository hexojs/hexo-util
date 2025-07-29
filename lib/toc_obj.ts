import * as htmlparser2 from 'htmlparser2';
import type { Element } from 'domhandler';
import escapeHTML from './escape_html.js';
const nonWord = /^\s*[^a-zA-Z0-9]\s*$/;

const parseHtml = (html: string) => {
  const handler = new htmlparser2.DomHandler(null, {});
  new htmlparser2.Parser(handler, {}).end(html);
  return handler.dom;
};

const getId = ({ attribs = {}, parent }: Element) => {
  return attribs.id || (!parent ? '' : getId(parent as Element));
};

/**
 * Identify a heading that to be unnumbered or not.
 */
const isUnnumbered = ({ attribs = {} }) => {
  return attribs['data-toc-unnumbered'] === 'true';
};

interface Result {
  text: string;
  id: string;
  level: number;
  unnumbered?: boolean;
}

export function tocObj(str: string, options = {}) {
  const { min_depth, max_depth } = Object.assign({
    min_depth: 1,
    max_depth: 6
  }, options);

  const headingsSelector = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].slice(min_depth - 1, max_depth);
  const headings = htmlparser2.DomUtils.find(
    element => 'tagName' in element && headingsSelector.includes(element.tagName),
    parseHtml(str),
    true,
    Infinity
  ) as Element[];
  const headingsLen = headings.length;

  if (!headingsLen) return [];

  const result: Result[] = [];

  for (let i = 0; i < headingsLen; i++) {
    const el = headings[i];
    const level = +el.name[1];
    const id = getId(el);
    const unnumbered = isUnnumbered(el);
    let text = '';
    for (const element of el.children) {
      const elText = htmlparser2.DomUtils.textContent(element);
      // Skip permalink symbol wrapped in <a>
      // permalink is a single non-word character, word = [a-Z0-9]
      // permalink may be wrapped in whitespace(s)
      if (!('name' in element) || element.name !== 'a' || !nonWord.test(elText)) {
        text += escapeHTML(elText);
      }
    }
    if (!text) text = escapeHTML(htmlparser2.DomUtils.textContent(el));

    const res: Result = { text, id, level };
    if (unnumbered) res.unnumbered = true;
    result.push(res);
  }

  return result;
}


// For ESM compatibility
export default tocObj;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = tocObj;
  // For ESM compatibility
  module.exports.default = tocObj;
}
