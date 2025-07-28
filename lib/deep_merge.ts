import deepmerge from 'deepmerge';

const arrayMerge = (target, source, options) => {
  const destination = target.slice();

  source.forEach((item, index) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
    } else if (options.isMergeableObject(item)) {
      destination[index] = deepmerge(target[index], item, options);
    } else if (!target.includes(item)) {
      destination.push(item);
    }
  });
  return destination;
};

export function deepMerge<T>(target: Partial<T>, source: Partial<T>) {
  return deepmerge(target, source, { arrayMerge });
}

export default deepMerge;
