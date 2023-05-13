export = class Cache<T> {
  cache: Map<string, T>;

  constructor() {
    this.cache = new Map();
  }

  set(id: string, value: T) {
    this.cache.set(id, value);
  }

  has(id: string) {
    return this.cache.has(id);
  }

  get(id: string) {
    return this.cache.get(id);
  }

  del(id: string) {
    this.cache.delete(id);
  }

  apply(id: string, value: T): T {
    if (this.has(id)) return this.get(id);

    if (typeof value === 'function') value = value();

    this.set(id, value);
    return value;
  }

  flush() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  dump() {
    return Object.fromEntries(this.cache);
  }
};
