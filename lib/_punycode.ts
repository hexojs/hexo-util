/** Highest positive signed 32-bit float value */
const maxInt: number = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

/** Bootstring parameters */
const base: number = 36;
const tMin: number = 1;
const tMax: number = 26;
const skew: number = 38;
const damp: number = 700;
const initialBias: number = 72;
const initialN: number = 128; // 0x80
const delimiter: string = '-'; // '\x2D'

/** Regular expressions */
const regexPunycode: RegExp = /^xn--/;
const regexNonASCII: RegExp = /[^\0-\x7F]/; // Note: U+007F DEL is excluded too.
const regexSeparators: RegExp = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

/** Error messages */
const errors: Record<string, string> = {
  overflow: 'Overflow: input needs wider integers to process',
  'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
  'invalid-input': 'Invalid input'
};

/** Convenience shortcuts */
const baseMinusTMin: number = base - tMin;
const floor: (n: number) => number = Math.floor;
const stringFromCharCode: (...codes: number[]) => string = String.fromCharCode;

/* --------------------------------------------------------------------------*/

/**
 * A generic error utility function.
 * @private
 */
function error(type: string): never {
  throw new RangeError(errors[type]);
}

/**
 * A generic `Array#map` utility function.
 * @private
 */
function map<T, U>(array: T[], callback: (item: T) => U): U[] {
  const result: U[] = [];
  let length = array.length;
  while (length--) {
    result[length] = callback(array[length]);
  }
  return result;
}

/**
 * A simple `Array#map`-like wrapper to work with domain name strings or email
 * addresses.
 * @private
 */
function mapDomain(domain: string, callback: (item: string) => string): string {
  const parts = domain.split('@');
  let result = '';
  if (parts.length > 1) {
    // In email addresses, only the domain name should be punycoded. Leave
    // the local part (i.e. everything up to `@`) intact.
    result = parts[0] + '@';
    domain = parts[1];
  }
  // Avoid `split(regex)` for IE8 compatibility. See #17.
  domain = domain.replace(regexSeparators, '\x2E');
  const labels = domain.split('.');
  const encoded = map(labels, callback).join('.');
  return result + encoded;
}

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 */
function ucs2decode(string: string): number[] {
  const output: number[] = [];
  let counter = 0;
  const length = string.length;
  while (counter < length) {
    const value = string.charCodeAt(counter++);
    if (value >= 0xd800 && value <= 0xdbff && counter < length) {
      // It's a high surrogate, and there is a next character.
      const extra = string.charCodeAt(counter++);
      if ((extra & 0xfc00) === 0xdc00) {
        // Low surrogate.
        output.push(((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000);
      } else {
        // It's an unmatched surrogate; only append this code unit, in case the
        // next code unit is the high surrogate of a surrogate pair.
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
}

/**
 * Creates a string based on an array of numeric code points.
 */
const ucs2encode = (codePoints: number[]): string => String.fromCodePoint(...codePoints);

/**
 * Converts a basic code point into a digit/integer.
 * @see `digitToBasic()`
 * @private
 */
const basicToDigit = function(codePoint: number): number {
  if (codePoint >= 0x30 && codePoint < 0x3a) {
    return 26 + (codePoint - 0x30);
  }
  if (codePoint >= 0x41 && codePoint < 0x5b) {
    return codePoint - 0x41;
  }
  if (codePoint >= 0x61 && codePoint < 0x7b) {
    return codePoint - 0x61;
  }
  return base;
};

/**
 * Converts a digit/integer into a basic code point.
 * @see `basicToDigit()`
 * @private
 */
const digitToBasic = function(digit: number, flag: number): number {
  //  0..25 map to ASCII a..z or A..Z
  // 26..35 map to ASCII 0..9
  return digit + 22 + (75 * Number(digit < 26)) - (Number(flag !== 0) << 5);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 * @private
 */
const adapt = function(delta: number, numPoints: number, firstTime: boolean): number {
  let k = 0;
  delta = firstTime ? floor(delta / damp) : delta >> 1;
  delta += floor(delta / numPoints);
  for (; /* no initialization */ delta > (baseMinusTMin * tMax) >> 1; k += base) {
    delta = floor(delta / baseMinusTMin);
  }
  return floor(k + (((baseMinusTMin + 1) * delta) / (delta + skew)));
};

/**
 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
 * symbols.
 */
const decode = function(input: string): string {
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

  for (let index = basic > 0 ? basic + 1 : 0; index < inputLength;) {
    // `index` is the index of the next character to be consumed.
    // Decode a generalized variable-length integer into `delta`,
    // which gets added to `i`. The overflow checking is easier
    // if we increase `i` as we go, then subtract off its starting
    // value at the end to obtain `delta`.
    const oldi = i;
    for (let w = 1, k = base; ; k += base) {
      if (index >= inputLength) {
        error('invalid-input');
      }

      const digit = basicToDigit(input.charCodeAt(index++));

      if (digit >= base) {
        error('invalid-input');
      }
      if (digit > floor((maxInt - i) / w)) {
        error('overflow');
      }

      i += digit * w;
      let t: number;
      if (k <= bias) {
        t = tMin;
      } else if (k >= bias + tMax) {
        t = tMax;
      } else {
        t = k - bias;
      }

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
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 */
const encode = function(input: string): string {
  const output = [];

  // Convert the input in UCS-2 to an array of Unicode code points.
  const inputArr = ucs2decode(input);

  // Cache the length.
  const inputLength = inputArr.length;

  // Initialize the state.
  let n = initialN;
  let delta = 0;
  let bias = initialBias;

  // Handle the basic code points.
  for (const currentValue of inputArr) {
    if (currentValue < 0x80) {
      output.push(stringFromCharCode(currentValue));
    }
  }

  const basicLength = output.length;
  let handledCPCount = basicLength;

  // `handledCPCount` is the number of code points that have been handled;
  // `basicLength` is the number of basic code points.

  // Finish the basic string with a delimiter unless it's empty.
  if (basicLength) {
    output.push(delimiter);
  }

  // Main encoding loop:
  while (handledCPCount < inputLength) {
    // All non-basic code points < n have been handled already. Find the next larger one:
    let m = maxInt;
    for (const currentValue of inputArr) {
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }

    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
    const handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
      error('overflow');
    }

    delta += (m - n) * handledCPCountPlusOne;
    n = m;

    for (const currentValue of inputArr) {
      if (currentValue < n && ++delta > maxInt) {
        error('overflow');
      }
      if (currentValue === n) {
        // Represent delta as a generalized variable-length integer.
        let q = delta;
        for (let k = base; ; k += base) {
          let t: number;
          if (k <= bias) {
            t = tMin;
          } else if (k >= bias + tMax) {
            t = tMax;
          } else {
            t = k - bias;
          }
          if (q < t) {
            break;
          }
          const qMinusT = q - t;
          const baseMinusT = base - t;
          output.push(stringFromCharCode(digitToBasic(t + (qMinusT % baseMinusT), 0)));
          q = floor(qMinusT / baseMinusT);
        }

        output.push(stringFromCharCode(digitToBasic(q, 0)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
        delta = 0;
        ++handledCPCount;
      }
    }

    ++delta;
    ++n;
  }
  return output.join('');
};

/**
 * Converts a Punycode string representing a domain name or an email address
 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
 * it doesn't matter if you call it on a string that has already been
 * converted to Unicode.
 */
const toUnicode = function(input: string): string {
  return mapDomain(input, string => {
    return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
  });
};

/**
 * Converts a Unicode string representing a domain name or an email address to
 * Punycode. Only the non-ASCII parts of the domain name will be converted,
 * i.e. it doesn't matter if you call it with a domain that's already in
 * ASCII.
 */
const toASCII = function(input: string): string {
  return mapDomain(input, string => {
    return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
  });
};

/* --------------------------------------------------------------------------*/

/** Define the public API */
const punycode: {
  version: string;
  ucs2: {
    decode: (string: string) => number[];
    encode: (codePoints: number[]) => string;
  };
  decode: (input: string) => string;
  encode: (input: string) => string;
  toASCII: (input: string) => string;
  toUnicode: (input: string) => string;
} = {
  version: '2.3.1',
  ucs2: {
    decode: ucs2decode,
    encode: ucs2encode
  },
  decode: decode,
  encode: encode,
  toASCII: toASCII,
  toUnicode: toUnicode
};

export { punycode };
