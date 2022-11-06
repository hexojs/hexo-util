const htmlEntityMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': '\'',
  '&#96;': '`',
  '&#x2F;': '/',
  '&#x3D;': '='
};

const regexHtml = new RegExp(Object.keys(htmlEntityMap).join('|'), 'g');

const unescapeHTML = (str: string) => {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  return str.replace(regexHtml, a => htmlEntityMap[a]);
};

export = unescapeHTML;
