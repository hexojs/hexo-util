class CacheMapper<K, V> implements Map<K, V> {
  cache: Map<K, V>;
  size: number;

  constructor() {
    this.cache = new Map();
  }
  clear(): void {
    this.cache.clear();
  }
  delete(key: K): boolean {
    throw this.cache.delete(key);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    return this.cache.forEach(callbackfn, thisArg);
  }
  entries(): IterableIterator<[K, V]> {
    return this.cache.entries();
  }
  keys(): IterableIterator<K> {
    return this.cache.keys();
  }
  values(): IterableIterator<V> {
    return this.cache.values();
  }
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.cache.entries();
  }
  [Symbol.toStringTag]: string;

  typeof() {
    return typeof this.cache;
  }

  set(id: K, value: V) {
    this.cache.set(id, value);
    // set cache size while set new value
    this.size = this.cache.size;
    return this;
  }

  has(id: K) {
    return this.cache.has(id);
  }

  get(id: K) {
    return this.cache.get(id);
  }

  del(id: K) {
    this.cache.delete(id);
    // set cache size while delete value
    this.size = this.cache.size;
  }

  apply(id: K, value: unknown) {
    if (this.has(id)) return this.get(id);

    if (typeof value === 'function') value = value();

    this.set(id, value as V);
    return value as V;
  }

  flush() {
    this.cache.clear();
  }

  dump() {
    return Object.fromEntries(this.cache);
  }
}

export = class Cache<V> {
  _innerMap: CacheMapper<string, V>;
  constructor() {
    this._innerMap = new CacheMapper<string, V>();
  }
  has(key: string) {
    return this._innerMap.has(key);
  }
  get(key: string) {
    return this._innerMap.get(key);
  }
  set(key: string, value:V) {
    return this._innerMap.set(key, value);
  }
  dump() {
    return this._innerMap.dump();
  }
  size() {
    return this._innerMap.size;
  }
  apply(key: string, value: V): V;
  apply(key: string, value: () => V): V;
  apply(key: string, value: (() => V) | V) {
    return this._innerMap.apply(key, value);
  }
  del(key: string) {
    return this._innerMap.del(key);
  }
  flush() {
    return this._innerMap.flush();
  }
}
