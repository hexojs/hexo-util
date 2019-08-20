'use strict';

require('chai').should();

describe('escapeDiacritic', () => {
  const escapeDiacritic = require('../../lib/escape_diacritic');

  it('default', () => {
    escapeDiacritic('Hell\u00F2 w\u00F2rld').should.eql('Hello world');
  });

  it('str must be a string', () => {
    try {
      escapeDiacritic();
    } catch (err) {
      err.should.have.property('message', 'str must be a string!');
    }
  });
});
