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

  it('size 0 after flush', () => {
    cache.flush();
    expect(cache.size()).to.equal(0);
  });
});
