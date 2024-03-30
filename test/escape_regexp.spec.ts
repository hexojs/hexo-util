import chai from 'chai';
import escapeRegExp from '../lib/escape_regexp';
chai.should();

describe('escapeRegExp', () => {
  it('default', () => {
    escapeRegExp('hello*world').should.eql('hello\\*world');
  });

  it('str must be a string', () => {
    escapeRegExp.should.throw('str must be a string!');
  });
});
