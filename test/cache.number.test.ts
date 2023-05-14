'use strict';

import { describe, it } from 'mocha';
import * as Hutil from '../lib';
import { expect } from 'chai';

// to run single test
// mocha --require ts-node/register --exit --grep "Cache - Typescript"

describe('Cache - Typescript', () => {
  describe('Cache - number', () => {
    const cache = new Hutil.Cache<number>();
    const dumpExpect = { foo: 1, bar: 2 };

    it('should be number', () => {
      // apply non-function
      expect(cache.apply('foo', 1)).to.be.an('number');
      // apply with function
      expect(cache.apply('bar', () => 2)).to.be.an('number');
    });

    it('add another and delete it', () => {
      // add `another`
      expect(cache.apply('another', 3)).to.equal(3);
      // size should be 3
      expect(cache.size()).to.equal(3);
      // add with function
      expect(cache.apply('another', () => 3)).to.equal(3);
      // size should be still 3
      expect(cache.size()).to.equal(3);
      // delete `another`
      cache.del('another');
    });

    it('final size should be 2', () => {
      // final size should be 2
      expect(cache.size()).to.equal(2);
    });

    it('should dump matches', () => {
      expect(cache.dump()).deep.equal(dumpExpect);
    });

    it('should be empty after flush', () => {
      cache.flush();
      expect(cache.size()).to.be.equal(0);
    });
  });
});
