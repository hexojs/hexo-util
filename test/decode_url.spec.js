'use strict';

require('chai').should();

describe('decodeURL', () => {
  const decodeURL = require('../lib/decode_url');

  it('regular', () => {
    const content = 'http://foo.com/';
    decodeURL(content).should.eql(content);
  });

  it('auth', () => {
    const content = 'http://user:pass@foo.com/';
    decodeURL(content).should.eql(content);
  });

  it('port', () => {
    const content = 'http://foo.com:8080/';
    decodeURL(content).should.eql(content);
  });

  it('space', () => {
    const content = 'http://foo.com/bar%20baz';
    decodeURL(content).should.eql('http://foo.com/bar baz');
  });

  it('unicode', () => {
    const content = 'http://foo.com/b%C3%A1r';
    decodeURL(content).should.eql('http://foo.com/bár');
  });

  it('decode once', () => {
    const content = 'http://fóo.com/bár';
    decodeURL(content).should.eql(content);
  });

  it('hash', () => {
    const content = 'http://foo.com/b%C3%A1r#b%C3%A0z';
    decodeURL(content).should.eql('http://foo.com/bár#bàz');
  });

  it('query', () => {
    const content = 'http://foo.com/bar?q%C3%BAery=b%C3%A1z';
    decodeURL(content).should.eql('http://foo.com/bar?qúery=báz');
  });

  it('multiple queries', () => {
    const content = 'http://foo.com/bar?query1=a%C3%A1a&query2=a%C3%A0a';
    decodeURL(content).should.eql('http://foo.com/bar?query1=aáa&query2=aàa');
  });

  it('hash and query', () => {
    const content = 'http://foo.com/bar?query=b%C3%A1z#f%C3%B3o';
    decodeURL(content).should.eql('http://foo.com/bar?query=báz#fóo');
  });

  it('idn', () => {
    const content = 'http://xn--br-mia.com/baz';
    decodeURL(content).should.eql('http://bár.com/baz');
  });

  it('path', () => {
    const content = '/foo/bar/';
    decodeURL(content).should.eql(content);
  });

  it('path with space', () => {
    const content = '/foo%20bar/baz/';
    decodeURL(content).should.eql('/foo bar/baz/');
  });

  it('path with unicode', () => {
    const content = '/foo/b%C3%A1r/';
    decodeURL(content).should.eql('/foo/bár/');
  });

  it('decode path once', () => {
    const content = '/foo/bár /';
    decodeURL(content).should.eql(content);
  });

  it('anchor with unicode', () => {
    const content = '#f%C3%B3o-b%C3%A1r';
    decodeURL(content).should.eql('#fóo-bár');
  });
});
