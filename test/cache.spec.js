'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

describe('Cache', () => {
  // const Cache = require('../dist').Cache; // <-- this also works
  const Cache = require('../dist/cache');
  const cache = new Cache();

  it('get & set', () => {
    cache.set('foo', 123);
    should.equal(cache.get('foo'), 123);
  });

  it('size', () => {
    cache.set('foobar', 456);
    should.equal(cache.size(), 2);
  });

  it('has', () => {
    should.equal(cache.has('foo'), true);
    should.equal(cache.has('bar'), false);
  });

  it('apply - non function', () => {
    should.equal(cache.apply('bar', 123), 123);
    should.equal(cache.apply('bar', 456), 123);
    should.equal(cache.apply('foo', 456), 123);
  });

  it('apply - function', () => {
    should.equal(
      cache.apply('baz', () => 123),
      123
    );
    should.equal(
      cache.apply('baz', () => 456),
      123
    );
  });

  it('dump', () => {
    expect(cache.dump()).to.include({
      bar: 123,
      baz: 123,
      foo: 123,
      foobar: 456
    });
  });

  it('del', () => {
    cache.del('baz');
    should.equal(cache.has('foo'), true);
    should.equal(cache.has('baz'), false);
  });

  it('flush', () => {
    cache.flush();
    should.equal(cache.has('foo'), false);
    should.equal(cache.has('bar'), false);
    should.equal(cache.has('baz'), false);
    should.equal(cache.size(), 0);
  });

  it('cache null', () => {
    cache.apply('foo', null);
    should.equal(cache.apply('foo', 123) === null, true);
  });

  // include typescript test
  require('./cache.number.test.ts');
});
