'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('slugize', function() {
  var slugize = require('../../lib/slugize');

  it('spaces', function() {
    slugize('Hello World').should.eql('Hello-World');
  });

  it('diacritic', function() {
    slugize('Hell\u00F2 w\u00F2rld').should.eql('Hello-world');
  });

  it('continous dashes', function() {
    slugize('Hello  World').should.eql('Hello-World');
  });

  it('prefixing and trailing dashes', function() {
    slugize('~Hello World~').should.eql('Hello-World');
  });

  it('other special characters', function() {
    slugize('Hello ~`!@#$%^&*()-_+=[]{}|\\;:"\'<>,.?/World').should.eql('Hello-World');
  });

  it('custom separator', function() {
    slugize('Hello World', {separator: '_'}).should.eql('Hello_World');
  });

  it('lower case', function() {
    slugize('Hello World', {transform: 1}).should.eql('hello-world');
  });

  it('upper case', function() {
    slugize('Hello World', {transform: 2}).should.eql('HELLO-WORLD');
  });

  it('non-english', function() {
    slugize('遊戲').should.eql('遊戲');
  });

  it('str must be a string', function() {
    try {
      slugize();
    } catch (err) {
      err.should.have.property('message', 'str must be a string!');
    }
  });
});
