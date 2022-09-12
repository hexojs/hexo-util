'use strict';

module.exports = class Cache {
  constructor() {
    this.cache = new Map();
  }

  set(id, value) {
    this.cache.set(id, value);
  }

  has(id) {
    return this.cache.has(id);
  }

  get(id) {
    return this.cache.get(id);
  }

  del(id) {
    this.cache.delete(id);
  }

  apply(id, value) {
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
