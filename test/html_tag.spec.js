'use strict';

require('chai').should();

describe('htmlTag', () => {
  const htmlTag = require('../lib/html_tag');

  it('tag', () => {
    htmlTag('hr').should.eql('<hr>');
  });

  it('tag + attrs', () => {
    htmlTag('img', {
      src: 'http://placekitten.com/200/300'
    }).should.eql('<img src="http://placekitten.com/200/300">');

    htmlTag('img', {
      src: 'http://placekitten.com/200/300',
      width: 200,
      height: 300
    }).should.eql('<img src="http://placekitten.com/200/300" width="200" height="300">');
  });

  it('tag + attrs + text', () => {
    htmlTag('a', {
      href: 'http://zespia.tw'
    }, 'My blog').should.eql('<a href="http://zespia.tw/">My blog</a>');
  });

  it('tag + empty ALT attr', () => {
    htmlTag('img', {
      src: 'http://placekitten.com/200/300',
      alt: ''
    }).should.eql('<img src="http://placekitten.com/200/300" alt="">');
  });

  it('passing a zero as attribute', () => {
    htmlTag('a', {
      href: 'http://zespia.tw',
      tabindex: 0
    }, 'My blog').should.eql('<a href="http://zespia.tw/" tabindex="0">My blog</a>');
  });

  it('passing a null alt attribute', () => {
    htmlTag('a', {
      href: 'http://zespia.tw',
      alt: null
    }, 'My blog').should.eql('<a href="http://zespia.tw/">My blog</a>');
  });

  it('passing a undefined alt attribute', () => {
    htmlTag('a', {
      href: 'http://zespia.tw',
      alt: undefined
    }, 'My blog').should.eql('<a href="http://zespia.tw/">My blog</a>');
  });

  it('tag is required', () => {
    try {
      htmlTag();
    } catch (err) {
      err.should.have.property('message', 'tag is required!');
    }
  });

  it('encode url', () => {
    htmlTag('img', {
      src: 'http://foo.com/bár.jpg'
    }).should.eql('<img src="http://foo.com/b%C3%A1r.jpg">');
  });

  it('escape html tag', () => {
    htmlTag('foo', {
      bar: '<b>'
    }, '<baz>').should.eql('<foo bar="&lt;b&gt;">&lt;baz&gt;</foo>');
  });

  it('escape html tag (escape off)', () => {
    htmlTag('foo', {
      bar: '<b>'
    }, '<baz>', false).should.eql('<foo bar="&lt;b&gt;"><baz></foo>');
  });

});
