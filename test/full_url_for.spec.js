'use strict';

describe('full_url_for', () => {
  const ctx = {
    config: {
      url: 'http://example.com'
    }
  };

  const fullUrlFor = require('../lib/full_url_for').bind(ctx);

  it('internal url - root directory', () => {
    ctx.config.url = 'https://example.com';
    fullUrlFor('index.html').should.eql(ctx.config.url + '/index.html');
    fullUrlFor('/').should.eql(ctx.config.url + '/');
  });

  it('internal url - subdirectory', () => {
    ctx.config.url = 'https://example.com/blog';
    fullUrlFor('index.html').should.eql(ctx.config.url + '/index.html');
    fullUrlFor('/').should.eql(ctx.config.url + '/');
  });

  it('internal url - no duplicate slash', () => {
    ctx.config.url = 'https://example.com';
    fullUrlFor('/index.html').should.eql('https://example.com/index.html');
  });

  it('external url', () => {
    [
      'https://hexo.io/',
      '//google.com/'
    ].forEach(url => {
      fullUrlFor(url).should.eql(url);
    });
  });

  it('only hash', () => {
    ctx.config.url = 'https://example.com/blog';
    fullUrlFor('#test').should.eql(ctx.config.url + '/#test');
  });

  it('data url', () => {
    [
      'mailto:foo@bar.com',
      'javascript:foo()'
    ].forEach(url => {
      fullUrlFor(url).should.eql(url);
    });
  });
});
