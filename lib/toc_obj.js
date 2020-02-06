'use strict';
const { DomHandler, DomUtils, Parser } = require('htmlparser2');
const escapeHTML = require('./escape_html');

const parseHtml = html => {
  const handler = new DomHandler(null, {});
  new Parser(handler, {}).end(html);
  return handler.dom;
};

const getId = ({ attribs, parent }) => {
  return attribs.id || (!parent ? null : getId(parent));
};

function tocObj(str, options = {}) {
  const { min_depth, max_depth } = Object.assign({
    min_depth: 1,
    max_depth: 6
  }, options);

  const headingsSelector = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].slice(min_depth - 1, max_depth);
  const headings = DomUtils.find(({ tagName }) => headingsSelector.includes(tagName), parseHtml(str), true);
  const headingsLen = headings.length;

  if (!headingsLen) return [];

  const result = [];

  for (let i = 0; i < headingsLen; i++) {
    const el = headings[i];
    const level = +el.name[1];
    const id = getId(el);
    const text = escapeHTML(DomUtils.getText(el));

    result.push({ text, id, level });
  }

  return result;
}

module.exports = tocObj;
