/**
 * Recursively creates a deep clone of the given value, handling circular references.
 *
 * This function supports:
 * - Primitives (`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`)
 * - Arrays (including nested arrays)
 * - Plain objects (including nested objects)
 * - Circular references (using WeakMap)
 *
 * Note: This does **not** handle special types like `Date`, `Map`, `Set`,
 * `RegExp`, or `Function`.
 *
 * @param param - The value to deep clone.
 * @param seen - Internal WeakMap to track circular references.
 * @returns A deep clone of the input value.
 */
function deepClone<T>(param: T, seen = new WeakMap()): T {
  if (param === null || typeof param !== 'object') {
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

  const newObj: Record<string, unknown> = {};
  seen.set(param as object, newObj);
  for (const key in param) {
    if (Object.prototype.hasOwnProperty.call(param, key)) {
      newObj[key] = deepClone((param as Record<string, unknown>)[key], seen);
    }
  }
  return newObj as T;
}

function isObject(item: unknown): item is Record<string, unknown> {
  return !!item && typeof item === 'object' && !Array.isArray(item);
}

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
    const resultObj: Record<string, unknown> = { ...target };
    seen.set(target as object, resultObj);
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (key in target) {
          resultObj[key] = deepMerge(
            (target as Record<string, unknown>)[key],
            (source as Record<string, unknown>)[key],
            seen
          );
        } else {
          resultObj[key] = deepClone((source as Record<string, unknown>)[key], seen);
        }
      }
    }
    return resultObj as T;
  }

  // Fallback: clone source
  return deepClone(source) as T;
}

export = deepMerge;
