import encodeURL from './encode_url';
import escapeHTML from './escape_html';
const regexUrl = /(cite|download|href|src|url)$/i;
const regexMeta = /^(og:|twitter:)(audio|image|url|video|player)(:secure_url)?$/i;

function encSrcset(str: string) {
  str.split(' ')
    .forEach(subStr => {
      if (subStr.match(/\S/)) {
        subStr = subStr.trim();
        str = str.replace(subStr, encodeURL(subStr));
      }
    });
  return str;
}

function htmlTag(tag: string, attrs: {
  [key: string]: string | boolean | null | undefined;
}, text?: string, escape = true) {
  if (!tag) throw new TypeError('tag is required!');

  let result = `<${escapeHTML(tag)}`;

  for (const i in attrs) {
    if (attrs[i] == null) result += '';
    else {
      if (i.match(regexUrl)
        || (tag === 'meta' && !String(attrs[i]).match(regexMeta) && String(Object.values(attrs)[0]).match(regexMeta))) {
        result += ` ${escapeHTML(i)}="${encodeURL(String(attrs[i]))}"`;
      } else if (attrs[i] === true || i === attrs[i]) result += ` ${escapeHTML(i)}`;
      else if (i.match(/srcset$/i)) result += ` ${escapeHTML(i)}="${encSrcset(String(attrs[i]))}"`;
      else result += ` ${escapeHTML(i)}="${escapeHTML(String(attrs[i]))}"`;
    }
  }

  if (escape && text && tag !== 'style') text = escapeHTML(String(text));
  if (text && tag === 'style') {
    text = text.replace(/url\(['"](.*?)['"]\)/gi, (urlAttr, url) => {
      return `url("${encodeURL(url)}")`;
    });
  }

  if (text == null) result += '>';
  else result += `>${text}</${escapeHTML(tag)}>`;

  return result;
}

export = htmlTag;
