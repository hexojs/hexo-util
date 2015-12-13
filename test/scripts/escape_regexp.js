'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('escapeRegExp', function() {
  var escapeRegExp = require('../../lib/escape_regexp');

  it('default', function() {
    escapeRegExp('hello*world').should.eql('hello\\*world');
  });

  it('str must be a string', function() {
    try {
      escapeRegExp();
    } catch (err) {
      err.should.have.property('message', 'str must be a string!');
    }
  });
});
