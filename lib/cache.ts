import { CacheMapper } from './CacheMapper';

export = class Cache<V> {
  cache: CacheMapper<string, V>;
  constructor() {
    this.cache = new CacheMapper<string, V>();
  }
  has(key: string) {
    return this.cache.has(key);
  }
  get(key: string) {
    return this.cache.get(key);
  }
  set(key: string, value: V) {
    return this.cache.set(key, value);
  }
  dump() {
    return Object.fromEntries(this.cache);
  }
  size() {
    return this.cache.size;
  }
  apply(key: string, value: V): V;
  apply(key: string, value: () => V): V;
  apply(key: string, value: (() => V) | V) {
    return this.cache.apply(key, value);
  }
  del(key: string) {
    return this.cache.del(key);
  }
  flush() {
    return this.cache.flush();
  }
};
