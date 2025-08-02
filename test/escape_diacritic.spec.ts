import chai from 'chai';
import escapeDiacritic from '../lib/escape_diacritic.js';
chai.should();

describe('escapeDiacritic', () => {
  it('default', () => {
    escapeDiacritic('Hell\u00F2 w\u00F2rld').should.eql('Hello world');
  });

  it('str must be a string', () => {
    escapeDiacritic.should.throw('str must be a string!');
  });
});
