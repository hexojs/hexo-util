'use strict';

require('chai').should();

describe('unescapeHTML', () => {
  const unescapeHTML = require('../lib/unescape_html');

  it('default', () => {
    unescapeHTML('&lt;p class&#x3D;&quot;foo&quot;&gt;Hello &quot;world&quot;.&lt;&#x2F;p&gt;').should.eql('<p class="foo">Hello "world".</p>');
  });

  it('str must be a string', () => {
    unescapeHTML.should.throw('str must be a string!');
  });
});
