'use strict';

describe('isExternalLink', () => {
  const ctx = {
    config: {
      url: 'https://example.com'
    }
  };

  const isExternalLink = require('../lib/is_external_link');

  it('invalid url', () => {
    isExternalLink('https://localhost:4000你好', ctx.config.url).should.eql(false);
  });

  it('external link', () => {
    isExternalLink('https://hexo.io/', ctx.config.url).should.eql(true);
    isExternalLink('//hexo.io/', ctx.config.url).should.eql(true);
  });

  it('internal link', () => {
    isExternalLink('https://example.com', ctx.config.url).should.eql(false);
    isExternalLink('//example.com', ctx.config.url).should.eql(false);
    isExternalLink('//example.com/archives/foo.html', ctx.config.url).should.eql(false);
    isExternalLink('/archives/foo.html', ctx.config.url).should.eql(false);
    isExternalLink('/archives//hexo.io', ctx.config.url).should.eql(false);
  });

  it('hash, mailto, javascript', () => {
    isExternalLink('#top', ctx.config.url).should.eql(false);
    isExternalLink('mailto:hi@hexo.io', ctx.config.url).should.eql(false);
    isExternalLink('javascript:alert(\'Hexo is Awesome\')', ctx.config.url).should.eql(false);
  });

  it('exclude - empty string', () => {
    ctx.config.external_link = {
      exclude: ''
    };
    isExternalLink('https://hexo.io/', ctx.config.url, ctx.config.external_link.exclude).should.eql(true);
  });

  it('exclude - string', () => {
    ctx.config.external_link = {
      exclude: 'foo.com'
    };
    isExternalLink('https://foo.com/', ctx.config.url, ctx.config.external_link.exclude).should.eql(false);
    isExternalLink('https://bar.com/', ctx.config.url, ctx.config.external_link.exclude).should.eql(true);
    isExternalLink('https://baz.com/', ctx.config.url, ctx.config.external_link.exclude).should.eql(true);
  });

  it('exclude - array', () => {
    ctx.config.external_link = {
      exclude: ['foo.com', 'bar.com']
    };
    isExternalLink('https://foo.com/', ctx.config.url, ctx.config.external_link.exclude).should.eql(false);
    isExternalLink('https://bar.com/', ctx.config.url, ctx.config.external_link.exclude).should.eql(false);
    isExternalLink('https://baz.com/', ctx.config.url, ctx.config.external_link.exclude).should.eql(true);
  });
});
