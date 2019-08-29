'use strict';

require('chai').should();

describe('slugize', () => {
  const slugize = require('../lib/slugize');

  it('spaces', () => {
    slugize('Hello World').should.eql('Hello-World');
  });

  it('diacritic', () => {
    slugize('Hell\u00F2 w\u00F2rld').should.eql('Hello-world');
  });

  it('continous dashes', () => {
    slugize('Hello  World').should.eql('Hello-World');
  });

  it('prefixing and trailing dashes', () => {
    slugize('~Hello World~').should.eql('Hello-World');
  });

  it('other special characters', () => {
    slugize('Hello ~`!@#$%^&*()-_+=[]{}|\\;:"\'<>,.?/World').should.eql('Hello-World');
  });

  it('custom separator', () => {
    slugize('Hello World', {separator: '_'}).should.eql('Hello_World');
  });

  it('lower case', () => {
    slugize('Hello World', {transform: 1}).should.eql('hello-world');
  });

  it('upper case', () => {
    slugize('Hello World', {transform: 2}).should.eql('HELLO-WORLD');
  });

  it('non-english', () => {
    slugize('遊戲').should.eql('遊戲');
  });

  it('str must be a string', () => {
    slugize.should.throw('str must be a string!');
  });
});
