/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict';

import { Cache } from '../lib';
import { describe, it } from 'mocha';
import { expect, should } from 'chai';

// to run single test
// npm run test-single -- "Cache - object"

interface HexoLocals {
  page: {
    path: string;
  };
  path: string;
  url: string;
  config: Record<string, any> & {
    relative_link: boolean;
  };
  theme: Record<string, any>;
  layout: string;
  env: any;
  view_dir: string;
  site: Record<string, any>;
  cache?: boolean;
}

describe('Cache - object', () => {
  const cache = new Cache<HexoLocals>();
  const value: HexoLocals = {
    page: {
      path: 'dummy/path/post.md'
    },
    path: 'dummy/path/post.md',
    url: 'http://example.com/',
    config: {
      relative_link: true
    },
    theme: {},
    layout: '',
    env: {},
    view_dir: '',
    site: {}
  };
  const valueMap = new Map(Object.entries(value));
  const cacheMap = new Cache<typeof valueMap>();
  // built-in Set same as Array
  const valueSet = new Set(Object.keys(value));
  const cacheSet = new Cache<typeof valueSet>();

  describe('plain object', () => {
    it('set', () => {
      cache.set('foo', value);
      should().equal(cache.size(), 1);
    });

    it('apply', () => {
      expect(cache.has('bar')).to.be.false;
      // should applied and return the same value
      should().equal(cache.apply('bar', value), value);
      // should not apply new value
      should().equal(cache.apply('bar', {} as typeof value), value);
      should().equal(cache.size(), 2);
    });
  });

  describe('object Map', () => {
    it('set', () => {
      cacheMap.set('foo', valueMap);
      should().equal(cacheMap.size(), 1);
    });
    it('apply', () => {
      // should applied and return the same value
      should().equal(cacheMap.apply('bar', valueMap), valueMap);
    });
    it('is valid Map', () => {
      const targetValue = cacheMap.get('bar');
      // built-in Map validate
      expect(targetValue! instanceof Map).to.be.true;
      expect('has' in targetValue!).to.be.true;
      expect(targetValue?.has('page')).to.be.true;
      // targetValue.page should same as value.page
      should().equal(targetValue?.get('page'), value.page);
    });
  });

  describe('object Set', () => {
    it('set', () => {
      cacheSet.set('foo', valueSet);
      should().equal(cacheSet.size(), 1);
    });
    it('apply', () => {
      // should applied and return the same value
      should().equal(cacheSet.apply('bar', valueSet), valueSet);
    });
    it('is valid Set', () => {
      const targetValue = cacheSet.get('bar');
      // built-in Map validate
      expect(targetValue! instanceof Set).to.be.true;
      expect(targetValue?.has('page')).to.be.true;
    });
  });

  it('size 0 after flush', () => {
    cache.flush();
    expect(cache.size()).to.equal(0);
    cacheMap.flush();
    expect(cacheMap.size()).to.equal(0);
  });
});
