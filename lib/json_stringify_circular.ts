/* eslint no-fallthrough: ["error", { "commentPattern": "break[\\s\\w]*omitted" }] */


/* ! (c) 2020 Andrea Giammarchi */
/* source https://github.com/WebReflection/flatted/blob/main/cjs/index.js */

const { parse: $parse, stringify: $stringify } = JSON;
const { keys } = Object;

const isObject = (value: unknown) => typeof value === 'object' && value !== null;

const ignore = {};

const noop = (_: unknown, value: unknown) => value;

// No longer needed, as we only care about objects for circular refs

/**
 * Recursively revives circular references in a parsed object.
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
 * Adds a value to a set of known values and returns its index.
 */
const set = (known: Map<unknown, string>, input: unknown[], value: unknown): string => {
  const index = String(input.push(value) - 1);
  known.set(value, index);
  return index;
};

/**
 * Parses a JSON string with support for circular references.
 * @param text - The JSON string to parse.
 * @param reviver - Optional function to transform the parsed values.
 * @returns The parsed object.
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
 * @param value - The object to stringify.
 * @param replacer - Optional function to transform the values before stringifying.
 * @param space - Optional number or string to use as a white space in the output.
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
 * Converts an object with circular references to JSON.
 * @param anyData - The object to convert.
 * @returns The JSON representation of the object.
 */
const toJSONBrowser = (anyData: unknown): unknown => $parse(stringify(anyData));
export { toJSONBrowser };

/**
 * Parses a circular object from JSON.
 * @param anyData - The JSON string to parse.
 * @returns The parsed object.
 */
const fromJSONBrowser = <T = unknown>(anyData: string): T => parse<T>($stringify(anyData));
export { fromJSONBrowser, parse as parseBrowser, stringify as stringifyBrowser };

/**
 * transform any object to json. Suppress `TypeError: Converting circular structure to JSON`
 * @param data
 * @returns
 */
/**
 * Transforms any object to JSON, suppressing `TypeError: Converting circular structure to JSON` (Browser version)
 * @param data - The object to stringify
 * @returns The JSON string representation
 */
export function jsonStringifyWithCircular(data: unknown): string {
  return stringify(data);
}

export { jsonStringifyWithCircular as jsonStringify };

/**
 * Parses JSON stringified with circular refs (Browser version)
 * @param data - The JSON string to parse
 * @returns The parsed object
 */
export function jsonParseWithCircular<T>(data: string): T {
  return parse(data) as T;
}

export { jsonParseWithCircular as jsonParse };
