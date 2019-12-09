'use strict';

const should = require('chai').should(); // eslint-disable-line
const hljs = require('highlight.js');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const validator = require('html-tag-validator');

const testJson = {
  foo: 1,
  bar: 2
};

const testString = JSON.stringify(testJson, null, '  ');

const gutterStart = '<td class="gutter"><pre>';
const gutterEnd = '</pre></td>';

const codeStart = '<td class="code"><pre>';
const codeEnd = '</pre></td>';

function gutter(start, end, disabled) {
  const result = [];

  for (let i = start; i <= end; i++) {
    if (disabled) {
      result.push('');
    } else {
      result.push(gutterStart + `<span class="line">${i}</span>` + gutterEnd);
    }
  }

  return result;
}

function code(str, lang) {
  let data;

  if (lang) {
    data = hljs.highlight(lang.toLowerCase(), str);
  } else if (lang === null) {
    data = {value: str};
  } else {
    data = {value: entities.encode(str)};
  }

  const lines = data.value.split('\n');

  return lines.map(current => {
    return codeStart + `<span class="line">${current}</span>` + codeEnd;
  });
}

function assertResult(result, gutter, code, className = 'plain', caption = '') {
  const start = `<figure class="highlight ${className}">${caption}<table>`;
  const end = '</table></figure>';
  let res = start;
  for (const i in gutter) {
    res += '<tr>' + gutter[i] + code[i] + '</tr>';
  }
  res += end;
  result.should.eql(res);
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
    assertResult(result, gutter(1, 4, true), code(testString));
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
      '<pre><code class="highlight plain">',
      entities.encode(testString),
      '</code></pre>'
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('wrap: false (with hljs, without lang)', done => {
    const result = highlight(testString, {gutter: false, wrap: false, hljs: true});
    result.should.eql([
      '<pre><code class="hljs plain">',
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
      hljs.highlight('json', testString).value,
      '</code></pre>'
    ].join(''));
    validateHtmlAsync(result, done);
  });

  it('wrap: false (with hljs, with lang)', done => {
    const result = highlight(testString, {gutter: false, wrap: false, hljs: true, lang: 'json'});
    hljs.configure({classPrefix: 'hljs-'});
    result.should.eql([
      '<pre><code class="hljs json">',
      hljs.highlight('json', testString).value,
      '</code></pre>'
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
    assertResult(result, gutter(1, 4), code(testString, 'json'), 'json');
    validateHtmlAsync(result, done);
  });

  it('auto detect', done => {
    const result = highlight(testString, {autoDetect: true});
    assertResult(result, gutter(1, 4), code(testString, 'json'), 'json');
    validateHtmlAsync(result, done);
  });

  it('don\'t highlight if language not found', done => {
    const result = highlight('test', {lang: 'jrowiejrowi'});
    assertResult(result, gutter(1, 1), code('test'));
    validateHtmlAsync(result, done);
  });

  it('don\'t highlight if parse failed');

  it('caption', done => {
    const result = highlight(testString, {
      caption: 'hello world'
    });

    assertResult(result, gutter(1, 4), code(testString), 'plain', '<figcaption>hello world</figcaption>');
    validateHtmlAsync(result, done);
  });

  it('tab', done => {
    const str = [
      'function fib(i){',
      '\tif (i <= 1) return i;',
      '\treturn fib(i - 1) + fib(i - 2);',
      '}'
    ].join('\n');

    const result = highlight(str, {tab: '  ', lang: 'js'});
    assertResult(result, gutter(1, 4), code(str.replace(/\t/g, '  '), 'js'), 'js');
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
    const result = highlight(str, {lang: 'xml'});
    assertResult(result, gutter(1, 1), code('<span class="tag">&lt;<span class="name">node</span>&gt;</span><span class="php"><span class="meta">&lt;?php</span> <span class="keyword">echo</span> <span class="string">"foo"</span>; <span class="meta">?&gt;</span></span><span class="tag">&lt;/<span class="name">node</span>&gt;</span>', null), 'xml');
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
    assertResult(result, gutter(1, 5), code('<span class="keyword">var</span> string = <span class="string">`</span>\n<span class="string">  Multi</span>\n<span class="string">  line</span>\n<span class="string">  string</span>\n<span class="string">`</span>', null), 'js');
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
    assertResult(result, gutter(1, 5), code('<span class="keyword">var</span> string = <span class="string">`</span>\n<span class="string">  Multi</span>\n<span class="string"></span>\n<span class="string">  string</span>\n<span class="string">`</span>', null), 'js');
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
    assertResult(result, gutter(1, 6), code('<span class="meta">"use strict"</span>;\n<span class="keyword">var</span> string = <span class="string">`</span>\n<span class="string">  Multi</span>\n<span class="string"></span>\n<span class="string">  string</span>\n<span class="string">`</span>', null), 'javascript');
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
    const result = highlight(str, {hljs: true, lang: 'javascript'});
    result.should.include(gutterStart);
    result.should.include(codeStart);
    result.should.include('code class="hljs javascript"');
    result.should.include('class="hljs-function"');
    gutter(1, 5).every(line => {
      return result.should.include(line);
    });
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
