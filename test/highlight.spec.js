'use strict';

const should = require('chai').should(); // eslint-disable-line
const hljs = require('highlight.js');
const entities = require('html-entities');
const validator = require('html-tag-validator');

const testJson = {
  foo: 1,
  bar: 2
};

const testString = JSON.stringify(testJson, null, '  ');

const start = '<figure class="highlight plaintext"><table><tr>';
const end = '</tr></table></figure>';

const gutterStart = '<td class="gutter"><pre>';
const gutterEnd = '</pre></td>';

const codeStart = '<td class="code"><pre>';
const codeEnd = '</pre></td>';

function gutter(start, end) {
  let result = gutterStart;

  for (let i = start; i <= end; i++) {
    result += `<span class="line">${i}</span><br>`;
  }

  result += gutterEnd;

  return result;
}

function code(str, lang) {
  let data;

  if (lang) {
    data = hljs.highlight(str, {
      language: lang.toLowerCase()
    });
  } else if (lang === null) {
    data = {value: str};
  } else {
    data = {value: entities.encode(str)};
  }

  const lines = data.value.split('\n');

  return lines.reduce((prev, current) => {
    return `${prev}<span class="line">${current}</span><br>`;
  }, codeStart) + codeEnd;
}

function assertResult(result, ...args) {
  result.should.eql(start + args.join('') + end);
}

function validateHtmlAsync(str, done) {
  validator(str, (err, ast) => {
    if (err) {
      done(err);
    } else {
      done();
    }
  });
}

describe('highlight', () => {
  const highlight = require('../lib/highlight');

  it('default', done => {
    const result = highlight(testString);
    assertResult(result, gutter(1, 4), code(testString));
    validateHtmlAsync(result, done);
  });

  it('str must be a string', () => {
    highlight.should.throw('str must be a string!');
  });

  it('gutter: false', done => {
    const result = highlight(testString, {gutter: false});
    assertResult(result, code(testString));
    validateHtmlAsync(result, done);
  });

  it('gutter: true, but "wrap: false" (conflict)', done => {
    const result = highlight(testString, {gutter: true, wrap: false});
    assertResult(result, gutter(1, 4), code(testString));
    validateHtmlAsync(result, done);
  });

  it('wrap: false (without hljs, without lang)', done => {
    const result = highlight(testString, {gutter: false, wrap: false});
    result.should.eql([
      '<pre><code class="highlight plaintext">',
      entities.encode(testString),
      '</code></pre>'
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('wrap: false (with hljs, without lang)', done => {
    const result = highlight(testString, {gutter: false, wrap: false, hljs: true});
    result.should.eql([
      '<pre><code class="hljs plaintext">',
      entities.encode(testString),
      '</code></pre>'
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('wrap: false (without hljs, with lang)', done => {
    const result = highlight(testString, {gutter: false, wrap: false, lang: 'json'});
    hljs.configure({classPrefix: ''});
    result.should.eql([
      '<pre><code class="highlight json">',
      hljs.highlight(testString, {
        language: 'json'
      }).value,
      '</code></pre>'
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('wrap: false (with hljs, with lang)', done => {
    const result = highlight(testString, {gutter: false, wrap: false, hljs: true, lang: 'json'});
    hljs.configure({classPrefix: 'hljs-'});
    result.should.eql([
      '<pre><code class="hljs json">',
      hljs.highlight(testString, {
        language: 'json'
      }).value,
      '</code></pre>'
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('wrap: false (with mark)', done => {
    const result = highlight(testString, {gutter: false, wrap: false, hljs: true, lang: 'json', mark: '1'});
    hljs.configure({classPrefix: 'hljs-'});
    result.should.eql([
      '<pre><code class="hljs json">',
      hljs.highlight(testString, {
        language: 'json'
      }).value.replace('{', '<mark>{</mark>'),
      '</code></pre>'
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('wrap: false (retain trailing newline)', done => {
    const result = highlight(testString + '\n', {gutter: false, wrap: false, hljs: true, lang: 'json'});
    hljs.configure({classPrefix: 'hljs-'});
    result.should.eql([
      '<pre><code class="hljs json">',
      hljs.highlight(testString, {
        language: 'json'
      }).value,
      '\n</code></pre>'
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('firstLine', done => {
    const result = highlight(testString, {firstLine: 3});
    assertResult(result, gutter(3, 6), code(testString));
    validateHtmlAsync(result, done);
  });

  it('lang = json', done => {
    const result = highlight(testString, {lang: 'json'});

    result.should.eql([
      '<figure class="highlight json"><table><tr>',
      gutter(1, 4),
      code(testString, 'json'),
      end
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('auto detect', done => {
    const result = highlight(testString, {autoDetect: true});

    result.should.eql([
      '<figure class="highlight json"><table><tr>',
      gutter(1, 4),
      code(testString, 'json'),
      end
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('don\'t highlight if language not found', done => {
    const result = highlight('test', {lang: 'jrowiejrowi'});
    assertResult(result, gutter(1, 1), code('test'));
    validateHtmlAsync(result, done);
  });

  // it('don\'t highlight if parse failed'); missing-unit-test

  it('caption', done => {
    const caption = 'hello world';
    const result = highlight(testString, {
      caption
    });

    result.should.eql([
      `<figure class="highlight plaintext"><figcaption>${caption}</figcaption><table><tr>`,
      gutter(1, 4),
      code(testString),
      end
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('caption (wrap: false)', done => {
    const caption = 'hello world';
    const result = highlight(testString, {
      gutter: false,
      wrap: false,
      caption
    });

    result.should.eql([
      '<pre>',
      `<div class="caption">${caption}</div>`,
      '<code class="highlight plaintext">',
      entities.encode(testString),
      '</code></pre>'
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('tab', done => {
    const spaces = '  ';
    const str = [
      'function fib(i){',
      '\tif (i <= 1) return i;',
      '\treturn fib(i - 1) + fib(i - 2);',
      '}'
    ].join('\n');

    const result = highlight(str, {tab: spaces, lang: 'js'});

    result.should.eql([
      '<figure class="highlight js"><table><tr>',
      gutter(1, 4),
      code(str.replace(/\t/g, spaces), 'js'),
      end
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('tab with wrap:false', done => {
    const spaces = '  ';
    const result = highlight('\t' + testString, {gutter: false, wrap: false, hljs: true, lang: 'json', tab: spaces});
    hljs.configure({classPrefix: 'hljs-'});
    result.should.eql([
      '<pre><code class="hljs json">',
      spaces,
      hljs.highlight(testString, {
        language: 'json'
      }).value,
      '</code></pre>'
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('escape html entity', done => {
    const str = [
      'deploy:',
      '  type: git',
      '  repo: <repository url>',
      '  branch: [branch]',
      '  message: [message]'
    ].join('\n');

    const result = highlight(str);
    result.should.include('&lt;repository url&gt;');
    validateHtmlAsync(result, done);
  });

  it('highlight sublanguages', done => {
    const str = '<node><?php echo "foo"; ?></node>';
    const result = highlight(str, { autoDetect: true });
    result.should.eql([
      '<figure class="highlight php-template"><table><tr>',
      gutter(1, 1),
      code('<span class="xml"><span class="tag">&lt;<span class="name">node</span>&gt;</span></span><span class="php"><span class="meta">&lt;?php</span> <span class="keyword">echo</span> <span class="string">&quot;foo&quot;</span>; <span class="meta">?&gt;</span></span><span class="xml"><span class="tag">&lt;/<span class="name">node</span>&gt;</span></span>', null),
      end
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('parse multi-line strings correctly', done => {
    const str = [
      'var string = `',
      '  Multi',
      '  line',
      '  string',
      '`'
    ].join('\n');

    const result = highlight(str, {lang: 'js'});
    result.should.eql([
      '<figure class="highlight js"><table><tr>',
      gutter(1, 5),
      code('<span class="keyword">var</span> string = <span class="string">`</span>\n<span class="string">  Multi</span>\n<span class="string">  line</span>\n<span class="string">  string</span>\n<span class="string">`</span>', null),
      end
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('parse multi-line strings including empty line', done => {
    const str = [
      'var string = `',
      '  Multi',
      '',
      '  string',
      '`'
    ].join('\n');

    const result = highlight(str, {lang: 'js'});
    result.should.eql([
      '<figure class="highlight js"><table><tr>',
      gutter(1, 5),
      code('<span class="keyword">var</span> string = <span class="string">`</span>\n<span class="string">  Multi</span>\n<span class="string"></span>\n<span class="string">  string</span>\n<span class="string">`</span>', null),
      end
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('auto detect of multi-line statement', done => {
    const str = [
      '"use strict";',
      'var string = `',
      '  Multi',
      '',
      '  string',
      '`'
    ].join('\n');

    const result = highlight(str, {autoDetect: true});
    result.should.eql([
      '<figure class="highlight typescript"><table><tr>',
      gutter(1, 6),
      code('<span class="meta">&quot;use strict&quot;</span>;</span><br><span class="line"><span class="keyword">var</span> <span class="built_in">string</span> = <span class="string">`</span></span><br><span class="line"><span class="string">  Multi</span></span><br><span class="line"><span class="string"></span></span><br><span class="line"><span class="string">  string</span></span><br><span class="line"><span class="string">`</span>', null),
      end
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('gives the highlight class to marked lines', done => {
    const str = [
      'roses are red',
      'violets are blue',
      'sugar is sweet',
      'and so are you'
    ].join('\n');

    const result = highlight(str, {mark: [1, 3, 5]});

    result.should.include('class="line marked">roses');
    result.should.include('class="line">violets');
    result.should.include('class="line marked">sugar');
    result.should.include('class="line">and');
    validateHtmlAsync(result, done);
  });

  it('hljs compatibility - with lines', done => {
    const str = [
      'function (a) {',
      '    if (a > 3)',
      '        return true;',
      '    return false;',
      '}'
    ].join('\n');
    const result = highlight(str, {hljs: true, lang: 'javascript' });
    result.should.include(gutterStart);
    result.should.include(codeStart);
    result.should.include('code class="hljs javascript"');
    result.should.include('class="hljs-function"');
    result.should.include(gutter(1, 5));
    validateHtmlAsync(result, done);
  });

  it('hljs compatibility - no lines', done => {
    const str = [
      'function (a) {',
      '    if (a > 3)',
      '        return true;',
      '    return false;',
      '}'
    ].join('\n');
    const result = highlight(str, {hljs: true, gutter: false, wrap: false, lang: 'javascript'});
    result.should.not.include(gutterStart);
    result.should.not.include(codeStart);
    result.should.include('code class="hljs javascript"');
    result.should.include('class="hljs-function"');
    validateHtmlAsync(result, done);
  });

  it('hljs compatibility - wrap is true', done => {
    const str = [
      'function (a) {',
      '    if (a > 3)',
      '        return true;',
      '    return false;',
      '}'
    ].join('\n');
    const result = highlight(str, {hljs: true, gutter: false, wrap: true, lang: 'javascript'});
    result.should.not.include(gutterStart);
    result.should.include(codeStart);
    result.should.include('code class="hljs javascript"');
    result.should.include('class="hljs-function"');
    validateHtmlAsync(result, done);
  });
});
