/**
 * Recursively creates a deep clone of the given value, handling circular references and special types.
 *
 * This function supports:
 * - Primitives (`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`)
 * - Arrays (including nested arrays)
 * - Plain objects (including nested objects)
 * - Special types: `Date`, `Map`, `Set`, `RegExp`, and `Function` (functions are returned as-is)
 * - Circular references (using WeakMap)
 *
 * Note: Functions are not cloned, but returned as-is. Other special types are deeply cloned.
 *
 * @param param - The value to deep clone.
 * @param seen - Internal WeakMap to track circular references.
 * @returns A deep clone of the input value.
 */
function deepClone<T>(param: T, seen = new WeakMap()): T {
  if (param === null || typeof param !== 'object') {
    return param;
  }

  // Handle special types
  if (param instanceof Date) {
    return new Date(param.getTime()) as unknown as T;
  }
  if (param instanceof RegExp) {
    return new RegExp(param.source, param.flags) as unknown as T;
  }
  if (param instanceof Map) {
    const result = new Map();
    seen.set(param as object, result);
    for (const [k, v] of param as unknown as Map<unknown, unknown>) {
      result.set(deepClone(k, seen), deepClone(v, seen));
    }
    return result as unknown as T;
  }
  if (param instanceof Set) {
    const result = new Set();
    seen.set(param as object, result);
    for (const v of param as unknown as Set<unknown>) {
      result.add(deepClone(v, seen));
    }
    return result as unknown as T;
  }
  if (typeof param === 'function') {
    // Functions are not clonable, return as-is
    return param;
  }

  // Only objects (not arrays) can be WeakMap keys
  if (seen.has(param as object)) {
    return seen.get(param as object);
  }

  if (Array.isArray(param)) {
    const arr: unknown[] = [];
    seen.set(param as unknown as object, arr);
    for (const item of param as unknown as unknown[]) {
      arr.push(deepClone(item, seen));
    }
    return arr as unknown as T;
  }

  const newObj: Record<PropertyKey, unknown> = {};
  seen.set(param as object, newObj);
  // Merge string keys
  for (const key in param) {
    if (Object.prototype.hasOwnProperty.call(param, key)) {
      newObj[key] = deepClone((param as Record<string, unknown>)[key], seen);
    }
  }
  // Merge symbol keys
  const symbols = Object.getOwnPropertySymbols(param as object);
  for (const sym of symbols) {
    newObj[sym] = deepClone((param as Record<symbol, unknown>)[sym], seen);
  }
  return newObj as T;
}

/**
 * Checks if a value is a plain object (not an array, null, or special type).
 *
 * @param item - The value to check.
 * @returns True if the value is a plain object, false otherwise.
 */
function isObject(item: unknown): item is Record<string, unknown> {
  return !!item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deeply merges two values, handling arrays, objects, and special types.
 *
 * - If both values are arrays, merges by index, unions nested arrays, and merges objects/maps/sets/functions at the same index.
 * - If both values are objects, merges properties recursively, handling special types (`Date`, `Map`, `Set`, `RegExp`, `Function`).
 * - If types differ, source replaces target.
 * - Handles circular references.
 *
 * @param target - The target value to merge into.
 * @param source - The source value to merge from.
 * @param seen - Internal WeakMap to track circular references.
 * @returns The deeply merged value.
 */
function deepMerge<T>(target: Partial<T>, source: Partial<T>, seen = new WeakMap()): T {
  // If source is a primitive, return source (replace target)
  if (source === null || typeof source !== 'object') {
    return deepClone(source) as T;
  }
  // If target is a primitive, but source is object/array, clone source
  if (target === null || typeof target !== 'object') {
    return deepClone(source) as T;
  }

  // Handle circular references
  if (seen.has(target as object)) {
    return seen.get(target as object);
  }

  // Array merge: merge objects at same index, otherwise use source value
  if (Array.isArray(target) && Array.isArray(source)) {
    const maxLength = Math.max(target.length, source.length);
    const resultArr: unknown[] = [];
    seen.set(target as object, resultArr);
    for (let i = 0; i < maxLength; i++) {
      const tVal = (target as unknown[])[i];
      const sVal = (source as unknown[])[i];
      if (i in target && i in source) {
        if (Array.isArray(tVal) && Array.isArray(sVal)) {
          // Union: all from target, then any from source not already present
          const union = [...(tVal as unknown[])];
          for (const v of sVal as unknown[]) {
            if (!union.some(u => u === v)) {
              union.push(v);
            }
          }
          resultArr[i] = union;
        } else if (Array.isArray(sVal)) {
          resultArr[i] = deepClone(sVal, seen);
        } else if (Array.isArray(tVal)) {
          resultArr[i] = deepClone(tVal, seen);
        } else if (isObject(tVal) && isObject(sVal)) {
          resultArr[i] = deepMerge(tVal, sVal, seen);
        } else if (tVal instanceof Date && sVal instanceof Date) {
          resultArr[i] = new Date(Math.max(tVal.getTime(), sVal.getTime()));
        } else if (tVal instanceof RegExp && sVal instanceof RegExp) {
          // Prefer source's RegExp
          resultArr[i] = new RegExp(sVal.source, sVal.flags);
        } else if (tVal instanceof Map && sVal instanceof Map) {
          // Merge maps: keys from both, values deep merged
          const merged = new Map(tVal);
          for (const [k, v] of sVal) {
            if (merged.has(k)) {
              merged.set(k, deepMerge(merged.get(k), v, seen));
            } else {
              merged.set(deepClone(k, seen), deepClone(v, seen));
            }
          }
          resultArr[i] = merged;
        } else if (tVal instanceof Set && sVal instanceof Set) {
          // Union of sets
          const merged = new Set(tVal);
          for (const v of sVal) {
            merged.add(deepClone(v, seen));
          }
          resultArr[i] = merged;
        } else if (typeof tVal === 'function' && typeof sVal === 'function') {
          // Prefer source's function
          resultArr[i] = sVal;
        } else if (typeof sVal !== 'undefined') {
          resultArr[i] = deepClone(sVal, seen);
        } else {
          resultArr[i] = deepClone(tVal, seen);
        }
      } else if (i in source) {
        resultArr[i] = deepClone(sVal, seen);
      } else if (i in target) {
        resultArr[i] = deepClone(tVal, seen);
      }
    }
    return resultArr as T;
  }

  // Object merge
  if (isObject(target) && isObject(source)) {
    const resultObj: Record<PropertyKey, unknown> = { ...target };
    seen.set(target as object, resultObj);
    // Merge string keys
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const tVal = (target as Record<string, unknown>)[key];
        const sVal = (source as Record<string, unknown>)[key];
        if (key in target) {
          // Handle special types
          if (tVal instanceof Date && sVal instanceof Date) {
            resultObj[key] = new Date(Math.max(tVal.getTime(), sVal.getTime()));
          } else if (tVal instanceof RegExp && sVal instanceof RegExp) {
            resultObj[key] = new RegExp(sVal.source, sVal.flags);
          } else if (tVal instanceof Map && sVal instanceof Map) {
            const merged = new Map(tVal);
            for (const [k, v] of sVal) {
              if (merged.has(k)) {
                merged.set(k, deepMerge(merged.get(k), v, seen));
              } else {
                merged.set(deepClone(k, seen), deepClone(v, seen));
              }
            }
            resultObj[key] = merged;
          } else if (tVal instanceof Set && sVal instanceof Set) {
            const merged = new Set(tVal);
            for (const v of sVal) {
              merged.add(deepClone(v, seen));
            }
            resultObj[key] = merged;
          } else if (typeof tVal === 'function' && typeof sVal === 'function') {
            resultObj[key] = sVal;
          } else {
            // Use 'as unknown as Partial<T>' to satisfy TS type system for deepMerge recursion
            resultObj[key] = deepMerge(tVal as unknown as Partial<T>, sVal as unknown as Partial<T>, seen);
          }
        } else {
          resultObj[key] = deepClone(sVal, seen);
        }
      }
    }
    // Merge symbol keys
    const sourceSymbols = Object.getOwnPropertySymbols(source);
    for (const sym of sourceSymbols) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tVal = (target as any)[sym];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sVal = (source as any)[sym];
      if (Object.prototype.hasOwnProperty.call(target, sym)) {
        // Handle special types for symbols
        if (tVal instanceof Date && sVal instanceof Date) {
          resultObj[sym] = new Date(Math.max(tVal.getTime(), sVal.getTime()));
        } else if (tVal instanceof RegExp && sVal instanceof RegExp) {
          resultObj[sym] = new RegExp(sVal.source, sVal.flags);
        } else if (tVal instanceof Map && sVal instanceof Map) {
          const merged = new Map(tVal);
          for (const [k, v] of sVal) {
            if (merged.has(k)) {
              merged.set(k, deepMerge(merged.get(k), v, seen));
            } else {
              merged.set(deepClone(k, seen), deepClone(v, seen));
            }
          }
          resultObj[sym] = merged;
        } else if (tVal instanceof Set && sVal instanceof Set) {
          const merged = new Set(tVal);
          for (const v of sVal) {
            merged.add(deepClone(v, seen));
          }
          resultObj[sym] = merged;
        } else if (typeof tVal === 'function' && typeof sVal === 'function') {
          resultObj[sym] = sVal;
        } else {
          resultObj[sym] = deepMerge(tVal, sVal, seen);
        }
      } else {
        resultObj[sym] = deepClone(sVal, seen);
      }
    }
    return resultObj as T;
  }

  // Fallback: clone source
  return deepClone(source) as T;
}


// For ESM compatibility
export default deepMerge;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = deepMerge;
  // For ESM compatibility
  module.exports.default = deepMerge;
}
