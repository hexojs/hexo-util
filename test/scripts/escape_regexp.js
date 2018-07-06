'use strict';

require('chai').should();

describe('escapeRegExp', () => {
  const escapeRegExp = require('../../lib/escape_regexp');

  it('default', () => {
    escapeRegExp('hello*world').should.eql('hello\\*world');
  });

  it('str must be a string', () => {
    try {
      escapeRegExp();
    } catch (err) {
      err.should.have.property('message', 'str must be a string!');
    }
  });
});
