'use strict';

describe('url_for', () => {
  const ctx = {
    config: {
      url: 'http://example.com'
    }
  };

  const urlFor = require('../lib/url_for').bind(ctx);

  it('should encode path', () => {
    ctx.config.root = '/';
    urlFor('fôo.html').should.eql('/f%C3%B4o.html');

    ctx.config.root = '/fôo/';
    urlFor('bár.html').should.eql('/f%C3%B4o/b%C3%A1r.html');
  });

  it('internal url (relative off)', () => {
    ctx.config.root = '/';
    urlFor('index.html').should.eql('/index.html');
    urlFor('/').should.eql('/');
    urlFor('/index.html').should.eql('/index.html');

    ctx.config.root = '/blog/';
    urlFor('index.html').should.eql('/blog/index.html');
    urlFor('/').should.eql('/blog/');
    urlFor('/index.html').should.eql('/blog/index.html');
  });

  it('internal url (relative on)', () => {
    ctx.config.relative_link = true;
    ctx.config.root = '/';

    ctx.path = '';
    urlFor('index.html').should.eql('index.html');

    ctx.path = 'foo/bar/';
    urlFor('index.html').should.eql('../../index.html');

    ctx.config.relative_link = false;
  });

  it('internal url (relative on) - should encode path just once', () => {
    ctx.config.relative_link = true;
    ctx.config.root = '/';

    ctx.path = 'foo/bar/';
    urlFor('fôo.html').should.eql('../../f%C3%B4o.html');

    ctx.config.relative_link = false;
  });

  it('internal url (options.relative)', () => {
    ctx.config.relative_link = false;
    ctx.path = 'foo/bar/';
    urlFor('index.html', {relative: true}).should.eql('../../index.html');

    ctx.config.relative_link = true;
    urlFor('index.html', {relative: false}).should.eql('/index.html');
    ctx.config.relative_link = false;
  });

  it('internal url - pretty_urls.trailing_index disabled', () => {
    ctx.config.root = '/';
    ctx.config.pretty_urls = {
      trailing_index: false,
      trailing_html: true
    };

    urlFor('index.html').should.eql('/');
    urlFor('/').should.eql('/');
    urlFor('/index.html').should.eql('/');

    ctx.config.root = '/blog/';
    urlFor('index.html').should.eql('/blog/');
    urlFor('/').should.eql('/blog/');
    urlFor('/index.html').should.eql('/blog/');
  });


  it('internal url - pretty_urls.trailing_html disabled', () => {
    ctx.config.root = '/';
    ctx.config.pretty_urls = {
      trailing_index: true,
      trailing_html: false
    };

    urlFor('index.html').should.eql('/index.html');
    urlFor('/').should.eql('/');
    urlFor('/foo/bar.html').should.eql('/foo/bar');

    ctx.config.root = '/blog/';
    urlFor('index.html').should.eql('/blog/index.html');
    urlFor('/').should.eql('/blog/');
    urlFor('/foo/bar.html').should.eql('/blog/foo/bar');
  });

  it('internal url - pretty_urls.trailing_index & pretty_urls.trailing_html disabled', () => {
    ctx.config.root = '/';
    ctx.config.pretty_urls = {
      trailing_index: false,
      trailing_html: false
    };

    urlFor('index.html').should.eql('/');
    urlFor('/').should.eql('/');
    urlFor('/foo/bar.html').should.eql('/foo/bar');

    ctx.config.root = '/blog/';
    urlFor('index.html').should.eql('/blog/');
    urlFor('/').should.eql('/blog/');
    urlFor('/foo/bar.html').should.eql('/blog/foo/bar');
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
      urlFor(url).should.eql(url);
    });
  });

  it('only hash', () => {
    urlFor('#test').should.eql('#test');
  });

  it('data url', () => {
    [
      'mailto:foo@bar.com',
      'javascript:foo()'
    ].forEach(url => {
      urlFor(url).should.eql(url);
    });
  });
});
