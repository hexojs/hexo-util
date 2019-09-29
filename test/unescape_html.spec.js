'use strict';

require('chai').should();

describe('unescapeHTML', () => {
  const unescapeHTML = require('../lib/unescape_html');

  it('default', () => {
    unescapeHTML('&lt;p&gt;Hello &quot;world&quot;.&lt;&#x2F;p&gt;').should.eql('<p>Hello "world".</p>');
  });

  it('str must be a string', () => {
    unescapeHTML.should.throw('str must be a string!');
  });
});
