'use strict';

require('chai').should();

describe('prettyUrls', () => {
  const prettyUrls = require('../lib/pretty_urls');

  it('default', () => {
    prettyUrls('//example.com/index.html').should.eql('//example.com/index.html');
    prettyUrls('/bar/foo.html').should.eql('/bar/foo.html');
    prettyUrls('/bar/foo/').should.eql('/bar/foo/');
  });

  it('trailing_index', () => {
    prettyUrls('//example.com/index.html', { trailing_index: false }).should.eql('//example.com/');
    prettyUrls('/bar/foo/index.html/index.html', { trailing_index: false }).should.eql('/bar/foo/index.html/');
    prettyUrls('/bar/foo.html', { trailing_index: false }).should.eql('/bar/foo.html');
  });

  it('trailing_html', () => {
    prettyUrls('//example.com/index.html', { trailing_html: false }).should.eql('//example.com/index.html');
    prettyUrls('/bar/foo/index.html/index.html', { trailing_html: false }).should.eql('/bar/foo/index.html/index.html');
    prettyUrls('/bar/foo.html', { trailing_html: false }).should.eql('/bar/foo');
  });

  it('trailing_index & trailing_html', () => {
    prettyUrls('//example.com/index.html', { trailing_index: false, trailing_html: false }).should.eql('//example.com/');
    prettyUrls('/bar/foo/index.html/index.html', { trailing_index: false, trailing_html: false }).should.eql('/bar/foo/index.html/');
    prettyUrls('/bar/foo.html', { trailing_index: false, trailing_html: false }).should.eql('/bar/foo');
  });
});
