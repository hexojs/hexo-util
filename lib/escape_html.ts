/**
 * fast-escape-html - MIT License - Made by SukkaW <https://skk.moe>
 * The fastest known HTML unescape function.
 * https://github.com/SukkaW/fast-escape-html
 * https://github.com/SukkaW/fast-escape-html/blob/1bb80ac857f0645b321761cbd0dc0d0098240407/src/unescape.ts
 *
 * This is also modified by SukkaW for use w/ Hexo. Hexo needs to escape more characters (=, /, `)
 * to work with template languages (nunjucks/pug/mustache), and also needs to avoid double escaping
 * HTML entities. After modification, this function is of course slower than `fast-escape-html`, but
 * is still faster than `lodash.escape` and `escape-goat` (where they even escape less symbols and do 
 * not avoid double escaping).
 */
const reHtmlEntity = /[&<>"'`/=]/;

function escapeHTML(str: string) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  // if (rAlreadyEscaped.test(str)) {
  //   // If the string is already escaped, return it as is
  //   return str;
  // }

  const match = reHtmlEntity.exec(str);

  if (match === null) { // faster than !match since no type conversion
    return str;
  }

  let escape = '';
  let html = '';

  let index = match.index;
  let lastIndex = 0;
  const len = str.length;


  let next = 0;
  let nextIndex = index;

  // iterate from the first match
  for (; index < len; index++) {

    /**
     * Adjust order for commonly seen symbols:
     * Take https://tc39.es/ecma262 as an example
    */
    switch (str.charCodeAt(index)) {
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      case 34: // "
        escape = '&quot;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 38: { // &
        // We need to skip already escaped entities
        // But instead of matching with regexp, we manually check the char code
        // https://github.com/markedjs/marked/blob/cb549065f16fbd4a01bab3292bfd2ab0b116c1b2/src/helpers.ts#L10
        nextIndex = index + 1;
        next = str.charCodeAt(nextIndex);
        if (next === 35) { // #, whether the it is "&#" combined
          nextIndex++;
          next = str.charCodeAt(nextIndex);
          if (next === 120 || next === 88) { // x or X, whether the it is "&#x" combined
            nextIndex++;
            next = str.charCodeAt(nextIndex);
          }
        }
        if ( // check whether it is /&#\w+/ or /&#x\w+/
          (next >= 48 && next <= 57) // 0-9
          || (next >= 97 && next <= 122) // a-z
          || (next >= 65 && next <= 90) // A-Z
        ) { // 0-9
          index = nextIndex + 1; // we already look ahead, let nextIndex catch up
          continue;
        }
        escape = '&amp;';
        break;
      }
      case 96: // `
        escape = '&#96;';
        break;
      case 47: // /
        escape = '&#x2F;';
        break;
      case 61: // =
        escape = '&#x3D;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.slice(lastIndex, index);
    }
    html += escape;

    lastIndex = index + 1;
  }

  if (lastIndex !== index) {
    html += str.slice(lastIndex, index);
  }

  return html;
}

export = escapeHTML;
