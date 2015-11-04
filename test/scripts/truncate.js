'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('truncate', function() {
  var truncate = require('../../lib/truncate');

  it('default', function() {
    truncate('Once upon a time in a world far far away')
      .should.eql('Once upon a time in a world...');
  });

  it('truncate', function() {
    truncate('Once upon a time in a world far far away', {length: 17})
      .should.eql('Once upon a ti...');
  });

  it('separator', function() {
    truncate('Once upon a time in a world far far away', {length: 17, separator: ' '})
      .should.eql('Once upon a...');
  });

  it('omission', function() {
    truncate('And they found that many people were sleeping better.', {length: 25, omission: '... (continued)'})
      .should.eql('And they f... (continued)');
  });

  it('str must be a string', function() {
    try {
      truncate();
    } catch (err) {
      err.should.have.property('message', 'str must be a string!');
    }
  });
});
