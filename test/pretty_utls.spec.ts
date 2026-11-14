import chai from 'chai';
import prettyUrls from '../lib/pretty_urls';
chai.should();

describe('prettyUrls', () => {
  it('default', () => {
    prettyUrls('//example.com/index.html').should.eql('//example.com/index.html');
    prettyUrls('/bar/foo.html').should.eql('/bar/foo.html');
    prettyUrls('/bar/foo/').should.eql('/bar/foo/');
  });

  it('trailing_index', () => {
    prettyUrls('index.html', { trailing_index: false }).should.eql('');
    prettyUrls('//example.com/index.html', { trailing_index: false }).should.eql('//example.com/');
    prettyUrls('/bar/foo/index.html/index.html', { trailing_index: false }).should.eql('/bar/foo/index.html/');
    prettyUrls('/bar/foo.html', { trailing_index: false }).should.eql('/bar/foo.html');
    prettyUrls('/docs/reindex.html', { trailing_index: false }).should.eql('/docs/reindex.html');
  });

  it('trailing_html', () => {
    prettyUrls('//example.com/index.html', { trailing_html: false }).should.eql('//example.com/index.html');
    prettyUrls('/bar/foo/index.html/index.html', { trailing_html: false }).should.eql('/bar/foo/index.html/index.html');
    prettyUrls('/bar/foo.html', { trailing_html: false }).should.eql('/bar/foo');
    prettyUrls('/docs/reindex.html', { trailing_html: false }).should.eql('/docs/reindex');
  });

  it('trailing_index & trailing_html', () => {
    prettyUrls('//example.com/index.html', { trailing_index: false, trailing_html: false }).should.eql('//example.com/');
    prettyUrls('/bar/foo/index.html/index.html', { trailing_index: false, trailing_html: false }).should.eql('/bar/foo/index.html/');
    prettyUrls('/bar/foo.html', { trailing_index: false, trailing_html: false }).should.eql('/bar/foo');
    prettyUrls('https://example.com/search-index.html', { trailing_index: false, trailing_html: false })
      .should.eql('https://example.com/search-index');
  });

  it('leaves URLs with a query or fragment untouched', () => {
    prettyUrls('/docs/index.html?next=/reindex.html', { trailing_index: false, trailing_html: false })
      .should.eql('/docs/index.html?next=/reindex.html');
    prettyUrls('/docs#reindex.html', { trailing_html: false }).should.eql('/docs#reindex.html');
  });

  it('leaves host-only and opaque URLs untouched', () => {
    prettyUrls('https://reindex.html', { trailing_html: false }).should.eql('https://reindex.html');
    prettyUrls('//index.html', { trailing_index: false }).should.eql('//index.html');
    prettyUrls('mailto:contact@example.html', { trailing_html: false }).should.eql('mailto:contact@example.html');
  });
});
