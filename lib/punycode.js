'use strict';

/* !
 * punycode 2.1.1
 * Licensed MIT (c) 2014-2019 Mathias Bynens <https://mathiasbynens.be/>
 * https://github.com/bestiejs/punycode.js
 *
 * Only punycode.toUnicode(input) is implemented
 */

/** Highest positive signed 32-bit float value */
const maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

/** Bootstring parameters */
const base = 36;
const tMin = 1;
const tMax = 26;
const skew = 38;
const damp = 700;
const initialBias = 72;
const initialN = 128; // 0x80
const delimiter = '-'; // '\x2D'

/** Regular expressions */
const regexPunycode = /^xn--/;
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

/** Error messages */
const errors = {
  'overflow': 'Overflow: input needs wider integers to process',
  'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
  'invalid-input': 'Invalid input'
};

/** Convenience shortcuts */
const { floor } = Math;
const baseMinusTMin = base - tMin;

/* --------------------------------------------------------------------------*/

/**
 * A generic error utility function.
 * @private
 * @param {String} type The error type.
 * @returns {Error} Throws a `RangeError` with the applicable error message.
 */
const error = (type) => {
  throw new RangeError(errors[type]);
};

/**
 * A generic `Array#map` utility function.
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} callback The function that gets called for every array
 * item.
 * @returns {Array} A new array of values returned by the callback function.
 */
const map = (array, fn) => {
  const result = [];
  let length = array.length;
  while (length--) {
    result[length] = fn(array[length]);
  }
  return result;
};

/**
 * A simple `Array#map`-like wrapper to work with domain name strings or email
 * addresses.
 * @private
 * @param {String} domain The domain name or email address.
 * @param {Function} callback The function that gets called for every
 * character.
 * @returns {Array} A new string of characters returned by the callback
 * function.
 */
const mapDomain = (string, fn) => {
  // Avoid `split(regex)` for IE8 compatibility. See https://github.com/bestiejs/punycode.js/issues/17.
  string = string.replace(regexSeparators, '\x2E');
  const labels = string.split('.');
  const encoded = map(labels, fn).join('.');
  return encoded;
};

/**
 * Converts a basic code point into a digit/integer.
 * @see `digitToBasic()`
 * @private
 * @param {Number} codePoint The basic numeric code point value.
 * @returns {Number} The numeric value of a basic code point (for use in
 * representing integers) in the range `0` to `base - 1`, or `base` if
 * the code point does not represent a value.
 */
const basicToDigit = (codePoint) => {
  if (codePoint - 0x30 < 0x0A) {
    return codePoint - 0x16;
  }
  if (codePoint - 0x41 < 0x1A) {
    return codePoint - 0x41;
  }
  if (codePoint - 0x61 < 0x1A) {
    return codePoint - 0x61;
  }
  return base;
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 * @private
 */
const adapt = (delta, numPoints, firstTime) => {
  let k = 0;
  delta = firstTime ? floor(delta / damp) : delta >> 1;
  delta += floor(delta / numPoints);
  for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
    delta = floor(delta / baseMinusTMin);
  }
  return floor(k + ((baseMinusTMin + 1) * delta / (delta + skew)));
};

/**
 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
 * symbols.
 * @memberOf punycode
 * @param {String} input The Punycode string of ASCII-only symbols.
 * @returns {String} The resulting string of Unicode symbols.
 */
const decode = (input) => {
  // Don't use UCS-2.
  const output = [];
  const inputLength = input.length;
  let i = 0;
  let n = initialN;
  let bias = initialBias;

  // Handle the basic code points: let `basic` be the number of input code
  // points before the last delimiter, or `0` if there is none, then copy
  // the first basic code points to the output.

  let basic = input.lastIndexOf(delimiter);
  if (basic < 0) {
    basic = 0;
  }

  for (let j = 0; j < basic; ++j) {
    // if it's not a basic code point
    if (input.charCodeAt(j) >= 0x80) {
      error('not-basic');
    }
    output.push(input.charCodeAt(j));
  }

  // Main decoding loop: start just after the last delimiter if any basic code
  // points were copied; start at the beginning otherwise.

  for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

    // `index` is the index of the next character to be consumed.
    // Decode a generalized variable-length integer into `delta`,
    // which gets added to `i`. The overflow checking is easier
    // if we increase `i` as we go, then subtract off its starting
    // value at the end to obtain `delta`.
    let oldi = i;
    for (let w = 1, k = base; /* no condition */; k += base) {

      if (index >= inputLength) {
        error('invalid-input');
      }

      const digit = basicToDigit(input.charCodeAt(index++));

      if (digit >= base || digit > floor((maxInt - i) / w)) {
        error('overflow');
      }

      i += digit * w;

      let t;
      if (k <= bias) t = tMin;
      else if (k >= bias + tMax) t = tMax;
      else t = k - bias;

      if (digit < t) {
        break;
      }

      const baseMinusT = base - t;
      if (w > floor(maxInt / baseMinusT)) {
        error('overflow');
      }

      w *= baseMinusT;

    }

    const out = output.length + 1;
    bias = adapt(i - oldi, out, oldi === 0);

    // `i` was supposed to wrap around from `out` to `0`,
    // incrementing `n` each time, so we'll fix that now:
    if (floor(i / out) > maxInt - n) {
      error('overflow');
    }

    n += floor(i / out);
    i %= out;

    // Insert `n` at position `i` of the output.
    output.splice(i++, 0, n);

  }

  return String.fromCodePoint(...output);
};

/**
 * Converts a Punycode string representing a domain name or an email address
 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
 * it doesn't matter if you call it on a string that has already been
 * converted to Unicode.
 * @memberOf punycode
 * @param {String} input The Punycoded domain name or email address to
 * convert to Unicode.
 * @returns {String} The Unicode representation of the given Punycode
 * string.
 */
const toUnicode = (input) => {
  return mapDomain(input, (string) => {
    return regexPunycode.test(string)
      ? decode(string.slice(4).toLowerCase())
      : string;
  });
};

module.exports = { toUnicode: toUnicode };
