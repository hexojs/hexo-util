interface Options {
  length?: number;
  omission?: string;
  separator?: string;
}

export function truncate(str: string, options: Options = {}): string {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  const length = options.length || 30;
  const omission = options.omission || '...';
  const { separator } = options;
  const omissionLength = omission.length;

  if (str.length < length) return str;

  if (separator) {
    const words = str.split(separator);
    let result = '';
    let resultLength = 0;

    for (const word of words) {
      if (resultLength + word.length + omissionLength < length) {
        result += word + separator;
        resultLength = result.length;
      } else {
        return result.substring(0, resultLength - 1) + omission;
      }
    }
  } else {
    return str.substring(0, length - omissionLength) + omission;
  }
}


// For ESM compatibility
export default truncate;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = truncate;
  // For ESM compatibility
  module.exports.default = truncate;
}
