'use strict';

require('chai').should();

describe('tocObj', () => {
  const tocObj = require('../lib/toc_obj');

  const html = [
    '<h1 id="title_1">Title 1</h1>',
    '<div id="title_1_1"><h2>Title 1.1</h2></div>',
    '<h3 id="title_1_1_1">Title 1.1.1</h3>',
    '<h2 id="title_1_2">Title 1.2</h2>',
    '<h2 id="title_1_3">Title 1.3</h2>',
    '<h3 id="title_1_3_1">Title 1.3.1</h3>',
    '<h1 id="title_2">Title 2</h1>',
    '<h2 id="title_2_1">Title 2.1</h2>',
    '<h1 id="title_3">Title should escape &, \', < and "</h1>',
    '<h1 id="title_4"><a name="chapter1">Chapter 1 should be printed to toc</a></h1>'
  ].join('');

  it('default', () => {
    const expected = [
      { text: 'Title 1', id: 'title_1', level: 1 },
      { text: 'Title 1.1', id: 'title_1_1', level: 2 },
      { text: 'Title 1.1.1', id: 'title_1_1_1', level: 3 },
      { text: 'Title 1.2', id: 'title_1_2', level: 2 },
      { text: 'Title 1.3', id: 'title_1_3', level: 2 },
      { text: 'Title 1.3.1', id: 'title_1_3_1', level: 3 },
      { text: 'Title 2', id: 'title_2', level: 1 },
      { text: 'Title 2.1', id: 'title_2_1', level: 2 },
      { text: 'Title should escape &amp;, &#39;, &lt; and &quot;', id: 'title_3', level: 1 },
      { text: 'Chapter 1 should be printed to toc', id: 'title_4', level: 1 }
    ];

    tocObj(html).should.eql(expected);
  });

  it('options - min_depth', () => {
    const expected = [
      { text: 'Title 1.1', id: 'title_1_1', level: 2 },
      { text: 'Title 1.1.1', id: 'title_1_1_1', level: 3 },
      { text: 'Title 1.2', id: 'title_1_2', level: 2 },
      { text: 'Title 1.3', id: 'title_1_3', level: 2 },
      { text: 'Title 1.3.1', id: 'title_1_3_1', level: 3 },
      { text: 'Title 2.1', id: 'title_2_1', level: 2 }
    ];

    tocObj(html, { min_depth: 2 }).should.eql(expected);
  });

  it('options - max_depth', () => {
    const expected = [
      { text: 'Title 1', id: 'title_1', level: 1 },
      { text: 'Title 1.1', id: 'title_1_1', level: 2 },
      { text: 'Title 1.2', id: 'title_1_2', level: 2 },
      { text: 'Title 1.3', id: 'title_1_3', level: 2 },
      { text: 'Title 2', id: 'title_2', level: 1 },
      { text: 'Title 2.1', id: 'title_2_1', level: 2 },
      { text: 'Title should escape &amp;, &#39;, &lt; and &quot;', id: 'title_3', level: 1 },
      { text: 'Chapter 1 should be printed to toc', id: 'title_4', level: 1 }
    ];

    tocObj(html, { max_depth: 2 }).should.eql(expected);
  });

  it('no id attribute', () => {
    const noid = '<h1>Title 1</h1>';
    const result = tocObj(noid);

    result[0].id.should.eql('');
  });

  it('empty value in id attribute', () => {
    const noid = '<h1 id="">Title 1</h1>';
    const result = tocObj(noid);

    result[0].id.should.eql('');
  });

  it('invalid input', () => {
    const foo = 'barbaz';
    const result = tocObj(foo);

    result.length.should.eql(0);
  });

  it('empty text', () => {
    const input = '<h1></h1>';
    const result = tocObj(input);

    result[0].text.should.eql('');
  });

  describe('children element', () => {
    it('<a> element with permalink + text', () => {
      const input = [
        '<h1><a>#</a>foo</h1>',
        '<h1>foo<a>#</a></h1>',
        '<h1><a>#</a>foo<a>#</a></h1>',
        '<h1><a># </a>foo</h1>',
        '<h1><a># </a>foo<a> #</a></h1>',
        '<h1><a>号</a>foo</h1>'
      ];
      const result = input.map(str => tocObj(str));

      result.forEach(str => str[0].text.should.eql('foo'));
    });

    it('<a> element - no text', () => {
      const input = '<h1><a>foo</a></h1>';
      const result = tocObj(input);

      result[0].text.should.eql('foo');
    });

    it('<a> element - single permalink', () => {
      const input = '<h1><a>#</a></h1>';
      const result = tocObj(input);

      result[0].text.should.eql('#');
    });

    it('<a> element - non-permalink', () => {
      const input = '<h1><a>a</a> one</h1>';
      const result = tocObj(input);

      result[0].text.should.eql('a one');
    });

    it('non-permalink <a> element + text', () => {
      const input = [
        '<h1><a>foo</a>bar</h1>',
        '<h1>foo<a>bar</a></h1>'
      ];
      const result = input.map(str => tocObj(str));

      result.forEach(str => str[0].text.should.eql('foobar'));
    });

    it('non-permalink <a> element + unicode text', () => {
      const input = [
        '<h1><a>这是</a>测试</h1>',
        '<h1>这是<a>测试</a></h1>'
      ];
      const result = input.map(str => tocObj(str));

      result.forEach(str => str[0].text.should.eql('这是测试'));
    });

    it('multiple <a> elements', () => {
      const input = '<h1><a>foo</a><a>bar</a></h1>';
      const result = tocObj(input);

      result[0].text.should.eql('foobar');
    });

    it('element + text', () => {
      const input = [
        '<h1><i>foo</i>barbaz</h1>',
        '<h1><i>foo</i>bar</i>baz</h1>',
        '<h1>foo<i>bar</i>baz</h1>',
        '<h1>foobarba<i>z</i></h1>'
      ];
      const result = input.map(str => tocObj(str));

      result.forEach(str => str[0].text.should.eql('foobarbaz'));
    });
  });
});
