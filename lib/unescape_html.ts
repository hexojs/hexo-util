/**
 * fast-escape-html - MIT License - Made by SukkaW <https://skk.moe>
 * The fastest known HTML unescape function.
 * https://github.com/SukkaW/fast-escape-html
 * https://github.com/SukkaW/fast-escape-html/blob/1bb80ac857f0645b321761cbd0dc0d0098240407/src/unescape.ts
 *
 * This is also modified by SukkaW for use w/ Hexo. Hexo needs to unescape more characters, but I managed
 * to adopt a few techniques from `fast-escape-html` to make this function faster than before
 */

// Specifically uses `Object.create(null)` to make lookup faster (no prototype chain lookup)
const htmlEntityMap = Object.create(null);

// Common HTML entities is placed first for faster lookup
htmlEntityMap['&lt;'] = '<';
htmlEntityMap['&gt;'] = '>';
htmlEntityMap['&quot;'] = '"';
htmlEntityMap['&#39;'] = '\'';
htmlEntityMap['&#x3D;'] = '=';
htmlEntityMap['&#x2F;'] = '/';
htmlEntityMap['&amp;'] = '&';
htmlEntityMap['&#96;'] = '`';

// This is specifically hand-crafted regexp to match common HTML entities first (for early return)
const reHtmlEntityGlobal = /&(?:[gl]t|quot|#39|#x(?:3D|2F)|amp|#6[02]|#34|apos|#38|#96);/g;

// Hoist function to maximize the function cache
const replacer = (match: string) => htmlEntityMap[match];

const unescapeHTML = (str: string) => {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  return str.replace(reHtmlEntityGlobal, replacer);
};

export = unescapeHTML;
