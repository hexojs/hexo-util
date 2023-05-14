export class CacheMapper<K, V> implements Map<K, V> {
  private _innerMap: Map<K, V>;
  size: number;

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
    this.size = this._innerMap.size;
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
    this.size = this._innerMap.size;
  }

  apply(id: K, value: unknown) {
    if (this.has(id)) return this.get(id);

    if (typeof value === 'function') value = value();

    this.set(id, value as V);
    return value as V;
  }

  flush() {
    this._innerMap.clear();

    // set cache size while flusing cache
    this.size = this._innerMap.size;
  }
}
