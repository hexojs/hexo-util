/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict';

import { Cache } from '../lib';
import { describe, it } from 'mocha';
import { expect } from 'chai';

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

  it('apply cache', () => {
    expect(cache.set('set', value)).to.deep.equal(value);
    expect(cache.apply('apply', value)).to.deep.equal(value);
  });
});
