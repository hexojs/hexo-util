/** @internal */
export class CacheMapper<K, V> implements Map<K, V> {
  private readonly _innerMap: Map<K, V>;
  readonly size: number;

  constructor() {
    this._innerMap = new Map();
  }
  clear(): void {
    this._innerMap.clear();
  }
  delete(key: K): boolean {
    throw this._innerMap.delete(key);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    return this._innerMap.forEach(callbackfn, thisArg);
  }
  entries(): IterableIterator<[K, V]> {
    return this._innerMap.entries();
  }
  keys(): IterableIterator<K> {
    return this._innerMap.keys();
  }
  values(): IterableIterator<V> {
    return this._innerMap.values();
  }
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this._innerMap.entries();
  }
  [Symbol.toStringTag]: string;

  typeof() {
    return typeof this._innerMap;
  }

  set(id: K, value: V) {
    this._innerMap.set(id, value);
    // set cache size while set new value
    // this.size = this._innerMap.size;
    return this;
  }

  has(id: K) {
    return this._innerMap.has(id);
  }

  get(id: K) {
    return this._innerMap.get(id);
  }

  del(id: K) {
    this._innerMap.delete(id);
    // set cache size while delete value
    // this.size = this._innerMap.size;
  }
}

/**
 * Generic Mutable Cache with `Map`
 * * A Map holds key-value pairs where the keys can be any datatype (Generic)
 * @example
 * import { Cache } from 'hexo-util';
 * const c = new Cache<number>();
 * // error
 * c.set('key', 'xxxx'); // cache value must be instance of number
 * // pass
 * c.set('key', 1);
 */
export class Cache<V> {
  private cache: CacheMapper<string, V>;
  constructor() {
    this.cache = new CacheMapper<string, V>();
  }

  /**
   * check cache is exist with given key
   * @param key cache key string
   * @returns
   */
  has(key: string) {
    return this.cache.has(key);
  }

  /**
   * get cache
   * @param key
   * @returns
   */
  get(key: string) {
    return this.cache.get(key);
  }

  /**
   * set cache
   * @param key
   * @param value cache value must same as constructor generic type
   * @returns
   */
  set(key: string, value: V) {
    return this.cache.set(key, value);
  }

  /**
   * dump cache
   * @returns
   */
  dump() {
    return Object.fromEntries(this.cache);
  }

  /**
   * get cache total
   * @returns
   */
  size() {
    return Array.from(this.cache.keys()).length;
  }

  /**
   * cacheable setter non-function
   * * new value will never updated when previous key already exist
   * @param key cache key string
   * @param value cache value must same as constructor generic type
   */
  apply(key: string, value: V): V;

  /**
   * cacheable setter with function
   * * new value will never updated when previous key already exist
   * @param key cache key string
   * @param value cache value must same as constructor generic type
   */
  apply(key: string, value: () => V): V;

  /**
   * cacheable setter
   * * new value will never updated when previous key already exist
   * @param key cache key string
   * @param value cache value must same as constructor generic type
   */
  apply(id: string, value: V & (() => V)) {
    if (this.has(id)) return this.get(id);
    let newValue: V;
    if (typeof value === 'function') {
      newValue = value();
    } else {
      newValue = value;
    }

    this.cache.set(id, newValue);
    return newValue;
  }

  del(key: string) {
    return this.cache.del(key);
  }
  flush() {
    this.cache.clear();
  }
}
