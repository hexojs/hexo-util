'use strict';
const { DomHandler, DomUtils, Parser } = require('htmlparser2');
const escapeHTML = require('./escape_html');

const parseHtml = html => {
  const handler = new DomHandler(null, {});
  new Parser(handler, {}).end(html);
  return handler.dom;
};

const getId = ele => {
  const { id } = ele.attribs;
  const { parent } = ele;
  return id || (!parent ? null : getId(parent));
};

function tocObj(str, options = {}) {
  options = Object.assign({
    min_depth: 1,
    max_depth: 6
  }, options);

  const headingsSelector = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].slice(options.min_depth - 1, options.max_depth).join(',');

  const dom = parseHtml(str);
  const headings = DomUtils.find(el => headingsSelector.includes(el.tagName), dom, true);

  const result = [];

  if (!headings.length) return result;

  for (const el of headings) {
    const level = +el.name[1];
    const id = getId(el);
    const text = escapeHTML(DomUtils.getText(el));

    result.push({ text, id, level });
  }

  return result;
}

module.exports = tocObj;
