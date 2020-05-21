'use strict';

require('chai').should();

describe('Cache', () => {
  const Cache = require('../lib/cache');
  const cache = new Cache();

  it('get & set', () => {
    cache.set('foo', 123);
    cache.get('foo').should.eql(123);
  });

  it('size', () => {
    cache.set('foobar', 456);
    cache.size().should.eql(2);
  });

  it('has', () => {
    cache.has('foo').should.eql(true);
    cache.has('bar').should.eql(false);
  });

  it('apply - non function', () => {
    cache.apply('bar', 123).should.eql(123);
    cache.apply('bar', 456).should.eql(123);

    cache.apply('foo', 456).should.eql(123);
  });

  it('apply - function', () => {
    cache.apply('baz', () => 123).should.eql(123);
    cache.apply('baz', () => 456).should.eql(123);
  });

  it('dump', () => {
    cache.dump().should.eql({
      'bar': 123,
      'baz': 123,
      'foo': 123,
      'foobar': 456
    });
  });

  it('del', () => {
    cache.del('baz');
    cache.has('foo').should.eql(true);
    cache.has('baz').should.eql(false);
  });

  it('flush', () => {
    cache.flush();
    cache.has('foo').should.eql(false);
    cache.has('bar').should.eql(false);
    cache.has('baz').should.eql(false);
    cache.size().should.eql(0);
  });

  it('cache null', () => {
    cache.apply('foo', null);
    (cache.apply('foo', 123) === null).should.eql(true);
  });
});
