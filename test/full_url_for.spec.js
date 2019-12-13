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

  it('internal url - pretty_urls.trailing_index disabled', () => {
    ctx.config.url = 'https://example.com';
    ctx.config.pretty_urls = {
      trailing_index: false,
      trailing_html: true
    };

    fullUrlFor('index.html').should.eql(ctx.config.url + '/');
    fullUrlFor('/').should.eql(ctx.config.url + '/');
  });

  it('internal url - pretty_urls.trailing_html disabled', () => {
    ctx.config.url = 'https://example.com';
    ctx.config.pretty_urls = {
      trailing_index: true,
      trailing_html: false
    };

    fullUrlFor('index.html').should.eql(ctx.config.url + '/index.html');
    fullUrlFor('/foo/bar.html').should.eql(ctx.config.url + '/foo/bar');
  });

  it('internal url - pretty_urls.trailing_index & pretty_urls.trailing_html disabled', () => {
    ctx.config.url = 'https://example.com';
    ctx.config.pretty_urls = {
      trailing_index: false,
      trailing_html: false
    };

    fullUrlFor('index.html').should.eql(ctx.config.url + '/');
    fullUrlFor('/').should.eql(ctx.config.url + '/');
    fullUrlFor('/foo/bar.html').should.eql(ctx.config.url + '/foo/bar');
  });


  it('absolute url', () => {
    [
      'https://hexo.io/',
      '//google.com/',
      // url_for shouldn't process external link even if trailing_index is disabled.
      'https://hexo.io/docs/index.html',
      // shouldn't process internal absolute url
      'http://example.com/foo/bar/',
      'https://example.com/foo/bar/'
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
