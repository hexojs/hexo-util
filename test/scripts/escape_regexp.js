'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('escape_regexp', function() {
  var escapeRegex = require('../../lib/escape_regexp');

  it('default', function() {
    escapeRegex('hello*world').should.eql('hello\\*world');
  });

  it('str must be a string', function() {
    try {
      escapeRegex();
    } catch (err) {
      err.should.have.property('message', 'str must be a string!');
    }
  });
});
