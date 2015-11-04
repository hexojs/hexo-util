'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('word_wrap', function() {
  var wordWrap = require('../../lib/word_wrap');

  it('default', function() {
    wordWrap('Once upon a time').should.eql('Once upon a time');
  });

  it('default width', function() {
    wordWrap('Once upon a time, in a kingdom called Far Far Away, a king fell ill, and finding a successor to the throne turned out to be more trouble than anyone could have imagined...')
      .should.eql('Once upon a time, in a kingdom called Far Far Away, a king fell ill, and finding\na successor to the throne turned out to be more trouble than anyone could have\nimagined...');
  });

  it('width = 8', function() {
    wordWrap('Once upon a time', {width: 8}).should.eql('Once\nupon a\ntime');
  });

  it('width = 1', function() {
    wordWrap('Once upon a time', {width: 1}).should.eql('Once\nupon\na\ntime');
  });

  it('str must be a string', function() {
    try {
      wordWrap();
    } catch (err) {
      err.should.have.property('message', 'str must be a string!');
    }
  });
});
