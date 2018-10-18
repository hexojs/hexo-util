'use strict';

const should = require('chai').should(); // eslint-disable-line

describe('escapeHTML', () => {
  const escapeHTML = require('../../lib/escape_html');

  it('default', () => {
    escapeHTML('<p>Hello "world".</p>').should.eql('&lt;p&gt;Hello &quot;world&quot;.&lt;&#x2F;p&gt;');
  });

  it('str must be a string', () => {
    try {
      escapeHTML();
    } catch (err) {
      err.should.have.property('message', 'str must be a string!');
    }
  });
});
