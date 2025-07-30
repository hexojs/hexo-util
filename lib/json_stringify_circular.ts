/* eslint no-fallthrough: ["error", { "commentPattern": "break[\\s\\w]*omitted" }] */


/* ! (c) 2020 Andrea Giammarchi */
/* source https://github.com/WebReflection/flatted/blob/main/cjs/index.js */

const { parse: $parse, stringify: $stringify } = JSON;
const { keys } = Object;

const isObject = (value: unknown) => typeof value === 'object' && value !== null;

const ignore = {};

const noop = (_: unknown, value: unknown) => value;

/**
 * Recursively revives circular references in a parsed object.
 *
 * @param input - The array of parsed objects.
 * @param parsed - A set of already parsed objects to avoid infinite recursion.
 * @param output - The current output object being revived.
 * @param $ - The reviver function to apply to each key/value pair.
 * @returns The revived object with circular references restored.
 */
const revive = (
  input: unknown[],
  parsed: Set<unknown>,
  output: Record<string, unknown>,
  $: (key: string, value: unknown) => unknown
): unknown => {
  const lazy: Array<{ k: string; a: [unknown[], Set<unknown>, Record<string, unknown>, (key: string, value: unknown) => unknown] }> = [];
  for (let ke = keys(output), { length } = ke, y = 0; y < length; y++) {
    const k = ke[y];
    const value = output[k];
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      // Only treat as reference if value is a string that is a number (index)
      const tmp = input[Number(value)];
      if (isObject(tmp) && !parsed.has(tmp)) {
        parsed.add(tmp);
        output[k] = ignore;
        lazy.push({ k, a: [input, parsed, tmp as Record<string, unknown>, $] });
      } else output[k] = $.call(output, k, tmp);
    } else if (output[k] !== ignore) output[k] = $.call(output, k, value);
  }
  for (let { length } = lazy, i = 0; i < length; i++) {
    const { k, a } = lazy[i];
    // eslint-disable-next-line prefer-spread
    output[k] = $.call(output, k, revive.apply(null, a));
  }
  return output;
};

/**
 * Adds a value to a set of known values and returns its index as a string.
 *
 * @param known - A map of known objects to their indices.
 * @param input - The array of input objects.
 * @param value - The value to add.
 * @returns The index of the value as a string.
 */
const set = (known: Map<unknown, string>, input: unknown[], value: unknown): string => {
  const index = String(input.push(value) - 1);
  known.set(value, index);
  return index;
};

/**
 * Parses a JSON string with support for circular references.
 *
 * @template T
 * @param text - The JSON string to parse.
 * @param reviver - Optional function to transform the parsed values.
 * @returns The parsed object of type T.
 */
const parse = <T = unknown>(text: string, reviver?: (this: unknown, key: string, value: unknown) => unknown): T => {
  const input = $parse(text);
  const value = input[0];
  const $ = reviver || noop;
  const tmp = isObject(value) ? revive(input, new Set(), value, $) : value;
  return $.call({ '': tmp }, '', tmp) as T;
};

/**
 * Stringifies an object into JSON with support for circular references.
 *
 * @param value - The object to stringify.
 * @param replacer - Optional function or array of strings to transform the values before stringifying.
 * @param space - Optional number or string to use as white space in the output.
 * @returns The JSON string representation of the object.
 */
const stringify = (
  value: unknown,
  replacer?: ((this: unknown, key: string, value: unknown) => unknown) | string[],
  space?: string | number
): string => {
  const isCallable = typeof replacer === 'function';
  let $: (k: string, v: unknown) => unknown;
  if (isCallable) {
    $ = replacer as (k: string, v: unknown) => unknown;
  } else if (typeof replacer === 'object') {
    $ = (k: string, v: unknown) => {
      if (k === '' || (replacer as string[]).indexOf(k) !== -1) return v;
      return undefined;
    };
  } else {
    $ = noop;
  }
  const known = new Map<unknown, string>();
  const input: unknown[] = [];
  const output: string[] = [];
  let i = +set(known, input, $.call({ '': value }, '', value));
  let firstRun = !i;
  while (i < input.length) {
    firstRun = true;
    output[i] = $stringify(input[i++], replace, space);
  }
  return '[' + output.join(',') + ']';

  function replace(this: unknown, key: string, value: unknown): unknown {
    if (firstRun) {
      firstRun = false;
      return value;
    }
    const after = $.call(this, key, value);
    if (isObject(after)) {
      if (after === null) return after;
      return known.get(after) || set(known, input, after);
    }
    return after;
  }
};

/**
 * Converts an object with circular references to a JSON-compatible object.
 *
 * @param anyData - The object to convert.
 * @returns The JSON-compatible representation of the object.
 */
const toJSON = (anyData: unknown): unknown => $parse(stringify(anyData));
export { toJSON };

/**
 * Parses a circular object from a JSON string.
 *
 * @template T
 * @param anyData - The JSON string to parse.
 * @returns The parsed object of type T.
 */
const fromJSON = <T = unknown>(anyData: string): T => parse<T>($stringify(anyData));
export { fromJSON, parse, stringify };

/**
 * Transforms any object to a JSON string, suppressing `TypeError: Converting circular structure to JSON`.
 *
 * @param data - The object to stringify.
 * @returns The JSON string representation.
 */
export function jsonStringifyWithCircular(data: unknown): string {
  return stringify(data);
}

export { jsonStringifyWithCircular as jsonStringify };

/**
 * Parses a JSON string that was stringified with circular references (browser version).
 *
 * @template T
 * @param data - The JSON string to parse.
 * @returns The parsed object of type T.
 */
export function jsonParseWithCircular<T>(data: string): T {
  return parse(data) as T;
}

export { jsonParseWithCircular as jsonParse };

// for CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = {
    parse,
    stringify,
    jsonStringifyWithCircular,
    jsonParseWithCircular,
    toJSON,
    fromJSON
  };
}
