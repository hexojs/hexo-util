'use strict';

describe('isExternalLink', () => {
  const ctx = {
    config: {
      url: 'https://example.com',
      external_link: {}
    }
  };

  const isExternalLink = require('../lib/is_external_link').bind(ctx);

  it('external link', () => {
    isExternalLink('https://hexo.io/').should.eql(true);
  });

  it('internal link', () => {
    isExternalLink('https://example.com').should.eql(false);
    isExternalLink('//example.com').should.eql(false);
    isExternalLink('//example.com/archives/foo.html').should.eql(false);
    isExternalLink('/archives/foo.html').should.eql(false);
  });

  it('hash, mailto, javascript', () => {
    isExternalLink('#top').should.eql(false);
    isExternalLink('mailto:hi@hexo.io').should.eql(false);
    isExternalLink('javascript:alert(\'Hexo is Awesome\')').should.eql(false);
  });

  it('exclude - empty string', () => {
    ctx.config.external_link.exclude = '';
    isExternalLink('https://hexo.io/').should.eql(true);
  });

  it('exclude - string', () => {
    ctx.config.external_link.exclude = 'foo.com';
    isExternalLink('https://foo.com/').should.eql(false);
    isExternalLink('https://bar.com/').should.eql(true);
    isExternalLink('https://baz.com/').should.eql(true);
  });

  it('exclude - array', () => {
    ctx.config.external_link.exclude = ['foo.com', 'bar.com'];
    isExternalLink('https://foo.com/').should.eql(false);
    isExternalLink('https://bar.com/').should.eql(false);
    isExternalLink('https://baz.com/').should.eql(true);
  });
});
