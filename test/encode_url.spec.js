'use strict';

require('chai').should();

describe('encodeURL', () => {
  const encodeURL = require('../lib/encode_url');

  it('regular', () => {
    const content = 'http://foo.com/';
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

  it('idn', () => {
    const content = 'http://bár.com/baz';
    encodeURL(content).should.eql('http://xn--br-mia.com/baz');
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
});
