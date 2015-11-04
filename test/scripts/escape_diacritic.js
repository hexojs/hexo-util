'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('escape_diacritic', function() {
  var escapeDiacritic = require('../../lib/escape_diacritic');

  it('default', function() {
    escapeDiacritic('Hell\u00F2 w\u00F2rld').should.eql('Hello world');
  });

  it('str must be a string', function() {
    try {
      escapeDiacritic();
    } catch (err) {
      err.should.have.property('message', 'str must be a string!');
    }
  });
});
