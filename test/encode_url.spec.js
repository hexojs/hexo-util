'use strict';

require('chai').should();

describe('encodeURL', () => {
  const encodeURL = require('../lib/encode_url');

  it('regular', () => {
    const content = 'http://foo.com/';
    encodeURL(content).should.eql(content);
  });

  it('auth', () => {
    const content = 'http://user:pass@foo.com/';
    encodeURL(content).should.eql(content);
  });

  it('port', () => {
    const content = 'http://foo.com:8080/';
    encodeURL(content).should.eql(content);
  });

  it('space', () => {
    const content = 'http://foo.com/bar baz';
    encodeURL(content).should.eql('http://foo.com/bar%20baz');
  });

  it('unicode', () => {
    const content = 'http://foo.com/bár';
    encodeURL(content).should.eql('http://foo.com/b%C3%A1r');
  });

  it('encode once', () => {
    const content = 'http://foo.com/b%C3%A1%20r';
    encodeURL(content).should.eql(content);
  });

  it('hash', () => {
    const content = 'http://foo.com/bár#bàz';
    encodeURL(content).should.eql('http://foo.com/b%C3%A1r#b%C3%A0z');
  });

  it('query', () => {
    const content = 'http://foo.com/bar?qúery=báz';
    encodeURL(content).should.eql('http://foo.com/bar?q%C3%BAery=b%C3%A1z');
  });

  it('query contains %', () => {
    const content = 'http://foo.com/bar?query=%';
    encodeURL(content).should.eql('http://foo.com/bar?query=%25');
  });

  it('path or query contains %', () => {
    const content = '/bar?query=%';
    encodeURL(content).should.eql('/bar?query=%25');
  });

  it('multiple queries', () => {
    const content = 'http://foo.com/bar?query1=aáa&query2=aàa';
    encodeURL(content).should.eql('http://foo.com/bar?query1=a%C3%A1a&query2=a%C3%A0a');
  });

  it('hash and query', () => {
    const content = 'http://foo.com/bar?query=báz#fóo';
    encodeURL(content).should.eql('http://foo.com/bar?query=b%C3%A1z#f%C3%B3o');
  });

  it('idn', () => {
    const content = 'http://bár.com/baz';
    encodeURL(content).should.eql('http://bár.com/baz');
  });

  it('idn - punycode', () => {
    const content = 'http://xn--br-mia.com/baz';
    encodeURL(content).should.eql('http://bár.com/baz');
  });

  it('path', () => {
    const content = '/foo/bar/';
    encodeURL(content).should.eql(content);
  });

  it('path with space', () => {
    const content = '/foo bar/baz/';
    encodeURL(content).should.eql('/foo%20bar/baz/');
  });

  it('path with unicode', () => {
    const content = '/foo/bár/';
    encodeURL(content).should.eql('/foo/b%C3%A1r/');
  });

  it('encode once', () => {
    const content = '/foo/b%C3%A1r%20/';
    encodeURL(content).should.eql(content);
  });

  it('anchor with unicode', () => {
    const content = '#fóo-bár';
    encodeURL(content).should.eql('#f%C3%B3o-b%C3%A1r');
  });

  it('data URLs', () => {
    const content = 'data:,Hello%2C%20World!';
    encodeURL(content).should.eql(content);
  });
});
