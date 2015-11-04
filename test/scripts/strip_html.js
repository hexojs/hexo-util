'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('strip_html', function() {
  var stripHTML = require('../../lib/strip_html');

  it('default', function() {
    stripHTML('Strip <i>these</i> tags!').should.eql('Strip these tags!');

    stripHTML('<b>Bold</b> no more!  <a href="more.html">See more here</a>...')
      .should.eql('Bold no more!  See more here...');

    stripHTML('<div id="top-bar">Welcome to my website!</div>')
      .should.eql('Welcome to my website!');
  });

  it('str must be a string', function() {
    try {
      stripHTML();
    } catch (err) {
      err.should.have.property('message', 'str must be a string!');
    }
  });
});
