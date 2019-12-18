'use strict';

module.exports = class Cache {
  constructor() {
    this.cache = {};
  }

  set(id, value) {
    this.cache[id] = value;
  }

  has(id) {
    return this.cache[id] != null;
  }

  get(id) {
    return this.cache[id];
  }

  apply(id, value) {
    if (this.has(id)) return this.get(id);

    if (typeof value === 'function') value = value();

    this.set(id, value);
    return value;
  }

  flush() {
    this.cache = {};
  }
};
