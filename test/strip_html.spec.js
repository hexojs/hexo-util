'use strict';

const stripHTML = require('../lib/strip_html');

describe('stripHTML', () => {
  it('should not strip invalid tags', () => {
    const text = 'lorem ipsum < a> < div>';

    stripHTML(text).should.eql(text);
  });

  it('should remove simple HTML tags', () => {
    const html = '<a href="">lorem <strong>ipsum</strong></a>';
    const text = 'lorem ipsum';

    stripHTML(html).should.eql(text);
  });

  it('should remove comments', () => {
    const html = '<!-- lorem -- ipsum -- --> dolor sit amet';
    const text = ' dolor sit amet';

    stripHTML(html).should.eql(text);
  });

  it('should strip tags within comments', () => {
    const html = '<!-- <strong>lorem ipsum</strong> --> dolor sit';
    const text = ' dolor sit';

    stripHTML(html).should.eql(text);
  });


  it('should not fail with nested quotes', () => {
    const html = '<article attr="foo \'bar\'">lorem</article> ipsum';
    const text = 'lorem ipsum';

    stripHTML(html).should.eql(text);
  });

  it('should strip extra < within tags', () => {
    const html = '<div<>>lorem ipsum</div>';
    const text = 'lorem ipsum';

    stripHTML(html).should.eql(text);
  });

  it('should strip <> within quotes', () => {
    const html = '<a href="<script>">lorem ipsum</a>';
    const text = 'lorem ipsum';

    stripHTML(html).should.eql(text);
  });
});
