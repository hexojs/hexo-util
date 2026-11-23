import chai from 'chai';
import truncate from '../lib/truncate';
chai.should();

describe('truncate', () => {
  it('default', () => {
    truncate('Once upon a time in a world far far away')
      .should.eql('Once upon a time in a world...');
  });

  it('shorter string', () => {
    truncate('Once upon')
      .should.eql('Once upon');
  });

  it('string at the default length', () => {
    const str = 'a'.repeat(30);
    truncate(str).should.eql(str);
  });

  it('string at the specified length', () => {
    truncate('abc', {length: 3}).should.eql('abc');
  });

  it('string at the specified length with a separator', () => {
    truncate('Once upon', {length: 9, separator: ' '}).should.eql('Once upon');
  });

  it('string at the specified length with an omission', () => {
    truncate('Once upon', {length: 9, omission: '…'}).should.eql('Once upon');
  });

  it('truncate', () => {
    truncate('Once upon a time in a world far far away', {length: 17})
      .should.eql('Once upon a ti...');
  });

  it('separator', () => {
    truncate('Once upon a time in a world far far away', {length: 17, separator: ' '})
      .should.eql('Once upon a...');
  });

  it('omission', () => {
    truncate('And they found that many people were sleeping better.', {length: 25, omission: '... (continued)'})
      .should.eql('And they f... (continued)');
  });

  it('str must be a string', () => {
    truncate.should.throw('str must be a string!');
  });
});
