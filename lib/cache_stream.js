'use strict';

const { Transform } = require('stream');

function CacheStream() {
  Transform.call(this);

  this._cache = [];
}

require('util').inherits(CacheStream, Transform);

CacheStream.prototype._transform = function(chunk, enc, callback) {
  this._cache.push(chunk);
  this.push(chunk);
  callback();
};

CacheStream.prototype.destroy = function() {
  this._cache.length = 0;
};

CacheStream.prototype.getCache = function() {
  return Buffer.concat(this._cache);
};

module.exports = CacheStream;
