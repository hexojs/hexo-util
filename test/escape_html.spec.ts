import chai from 'chai';
import escapeHTML from '../lib/escape_html';
chai.should();

describe('escapeHTML', () => {
  it('default', () => {
    escapeHTML('<p class="foo">Hello `world`.</p>').should.eql('&lt;p class&#x3D;&quot;foo&quot;&gt;Hello &#96;world&#96;.&lt;&#x2F;p&gt;');
  });

  it('str must be a string', () => {
    escapeHTML.should.throw('str must be a string!');
  });

  it('avoid double escape', () => {
    escapeHTML('&lt;foo>bar</foo&gt;&#x2F;|&6>').should.eql('&lt;foo&gt;bar&lt;&#x2F;foo&gt;&#x2F;|&6&gt;');
  });

  it('avoid double escape https://github.com/hexojs/hexo/issues/4946', () => {
    escapeHTML('&emsp;&nbsp;&ensp;').should.eql('&emsp;&nbsp;&ensp;');
  });
});
