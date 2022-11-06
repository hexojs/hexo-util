import escapeDiacritic from './escape_diacritic';
import escapeRegExp from './escape_regexp';
// eslint-disable-next-line no-control-regex
const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'<>,.?/]+/g;

interface Options {
  separator?: string;
  transform?: number;
}

function slugize(str: string, options: Options = {}) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  const separator = options.separator || '-';
  const escapedSep = escapeRegExp(separator);

  const result = escapeDiacritic(str)
    // Remove control characters
    .replace(rControl, '')
    // Replace special characters
    .replace(rSpecial, separator)
    // Remove continous separators
    .replace(new RegExp(`${escapedSep}{2,}`, 'g'), separator)
    // Remove prefixing and trailing separtors
    .replace(new RegExp(`^${escapedSep}+|${escapedSep}+$`, 'g'), '');

  switch (options.transform) {
    case 1:
      return result.toLowerCase();

    case 2:
      return result.toUpperCase();

    default:
      return result;
  }
}

export = slugize;
