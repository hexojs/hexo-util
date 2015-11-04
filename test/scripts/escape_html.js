'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('escape_html', function() {
  var escapeHTML = require('../../lib/escape_html');

  it('default', function() {
    escapeHTML('<p>Hello "world".</p>').should.eql('&lt;p&gt;Hello &quot;world&quot;.&lt;&#x2F;p&gt;');
  });

  it('str must be a string', function() {
    try {
      escapeHTML();
    } catch (err) {
      err.should.have.property('message', 'str must be a string!');
    }
  });
});
