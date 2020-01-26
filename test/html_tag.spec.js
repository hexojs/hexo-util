'use strict';

require('chai').should();

describe('htmlTag', () => {
  const htmlTag = require('../lib/html_tag');
  const encodeURL = require('../lib/encode_url');

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

  it('srcset', () => {
    htmlTag('img', {
      srcset: 'fóo.jpg 320w,/foo/bár.jpeg 480w,default.png'
    }).should.eql('<img srcset="f%C3%B3o.jpg 320w,/foo/b%C3%A1r.jpeg 480w,default.png">');
  });

  it('srcset with whitespace', () => {
    htmlTag('img', {
      srcset: `fóo.jpg 320w,
        /foo/bár.jpeg 480w,
        default.png`
    }).should.eql(`<img srcset="f%C3%B3o.jpg 320w,
        /foo/b%C3%A1r.jpeg 480w,
        default.png">`);
  });

  it('should not encode style tag', () => {
    const text = 'p { content: "<"; }';
    htmlTag('style', {}, text).should.eql('<style>' + text + '</style>');
  });

  it('should encode url in style tag', () => {
    const text = 'p { background: url("bár.jpg"); }';
    htmlTag('style', {}, text).should.eql('<style>p { background: url("b%C3%A1r.jpg"); }</style>');
  });

  it('script tag with async', () => {
    htmlTag('script', {
      src: '/foo.js',
      async: true
    }, '').should.eql('<script src="/foo.js" async></script>');
  });

  it('meta tag', () => {
    htmlTag('meta', {
      property: 'og:title',
      content: 'foo & bar'
    }).should.eql('<meta property="og:title" content="foo &amp; bar">');

    htmlTag('meta', {
      name: 'twitter:title',
      content: 'foo " bar'
    }).should.eql('<meta name="twitter:title" content="foo &quot; bar">');
  });

  it('meta tag - url', () => {
    const content = 'https://foo.com/bár.jpg';
    const encoded = encodeURL(content);

    htmlTag('meta', {
      property: 'og:url',
      content
    }).should.eql(`<meta property="og:url" content="${encoded}">`);

    htmlTag('meta', {
      property: 'og:image:secure_url',
      content
    }).should.eql(`<meta property="og:image:secure_url" content="${encoded}">`);

    htmlTag('meta', {
      name: 'twitter:image',
      content
    }).should.eql(`<meta name="twitter:image" content="${encoded}">`);

    htmlTag('meta', {
      name: 'foo image',
      content: 'bar " baz'
    }).should.eql('<meta name="foo image" content="bar &quot; baz">');
  });

  it('meta tag - numeric property', () => {
    htmlTag('meta', {
      property: 'fb:app_id',
      content: 123456789
    }).should.eql('<meta property="fb:app_id" content="123456789">');
  });
});
