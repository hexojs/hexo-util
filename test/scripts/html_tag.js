'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('html_tag', function() {
  var htmlTag = require('../../lib/html_tag');

  it('tag', function() {
    htmlTag('hr').should.eql('<hr>');
  });

  it('tag + attrs', function() {
    htmlTag('img', {
      src: 'http://placekitten.com/200/300'
    }).should.eql('<img src="http://placekitten.com/200/300">');

    htmlTag('img', {
      src: 'http://placekitten.com/200/300',
      width: 200,
      height: 300
    }).should.eql('<img src="http://placekitten.com/200/300" width="200" height="300">');
  });

  it('tag + attrs + text', function() {
    htmlTag('a', {
      href: 'http://zespia.tw'
    }, 'My blog').should.eql('<a href="http://zespia.tw">My blog</a>');
  });

  it('tag is required', function() {
    try {
      htmlTag();
    } catch (err) {
      err.should.have.property('message', 'tag is required!');
    }
  });
});
