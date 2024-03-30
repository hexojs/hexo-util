import chai from 'chai';
import unescapeHTML from '../lib/unescape_html';
chai.should();

describe('unescapeHTML', () => {
  it('default', () => {
    unescapeHTML('&lt;p class&#x3D;&quot;foo&quot;&gt;Hello &quot;world&quot;.&lt;&#x2F;p&gt;').should.eql('<p class="foo">Hello "world".</p>');
  });

  it('str must be a string', () => {
    unescapeHTML.should.throw('str must be a string!');
  });
});
