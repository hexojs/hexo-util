'use strict';

var should = require('chai').should(); // eslint-disable-line
var hljs = require('highlight.js');
var Entities = require('html-entities').XmlEntities;
var entities = new Entities();

var testJson = {
  foo: 1,
  bar: 2
};

var testString = JSON.stringify(testJson, null, '  ');

var start = '<figure class="highlight plain"><table><tr>';
var end = '</tr></table></figure>';

var gutterStart = '<td class="gutter"><pre>';
var gutterEnd = '</pre></td>';

var codeStart = '<td class="code"><pre>';
var codeEnd = '</pre></td>';

function gutter(start, end) {
  var result = gutterStart;

  for (var i = start; i <= end; i++) {
    result += '<span class="line">' + i + '</span><br>';
  }

  result += gutterEnd;

  return result;
}

function code(str, lang) {
  var data;

  if (lang) {
    data = hljs.highlight(lang.toLowerCase(), str);
  } else {
    data = {value: entities.encode(str)};
  }

  var lines = data.value.split('\n');
  var result = codeStart;

  for (var i = 0, len = lines.length; i < len; i++) {
    result += '<span class="line">' + lines[i] + '</span><br>';
  }

  result += codeEnd;

  return result;
}

function assertResult(result) {
  var expected = start;

  for (var i = 1, len = arguments.length; i < len; i++) {
    expected += arguments[i];
  }

  expected += end;

  result.should.eql(expected);
}

describe('highlight', function() {
  var highlight = require('../../lib/highlight');

  it('default', function() {
    var result = highlight(testString);
    assertResult(result, gutter(1, 4), code(testString));
  });

  it('str must be a string', function() {
    try {
      highlight();
    } catch (err) {
      err.should.have.property('message', 'str must be a string!');
    }
  });

  it('gutter: false', function() {
    var result = highlight(testString, {gutter: false});
    assertResult(result, code(testString));
  });

  it('wrap: false', function() {
    var result = highlight(testString, {wrap: false});
    result.should.eql(entities.encode(testString));
  });

  it('firstLine', function() {
    var result = highlight(testString, {firstLine: 3});
    assertResult(result, gutter(3, 6), code(testString));
  });

  it('lang = json', function() {
    var result = highlight(testString, {lang: 'json'});

    result.should.eql([
      '<figure class="highlight json"><table><tr>',
      gutter(1, 4),
      code(testString, 'json'),
      end
    ].join(''));
  });

  it('auto detect', function() {
    var result = highlight(testString, {autoDetect: true});

    result.should.eql([
      '<figure class="highlight json"><table><tr>',
      gutter(1, 4),
      code(testString, 'json'),
      end
    ].join(''));
  });

  it('don\'t highlight if language not found', function() {
    var result = highlight('test', {lang: 'jrowiejrowi'});
    assertResult(result, gutter(1, 1), code('test'));
  });

  it('don\'t highlight if parse failed');

  it('caption', function() {
    var result = highlight(testString, {
      caption: 'hello world'
    });

    result.should.eql([
      '<figure class="highlight plain"><figcaption>hello world</figcaption><table><tr>',
      gutter(1, 4),
      code(testString),
      end
    ].join(''));
  });

  it('tab', function() {
    var str = [
      'function fib(i){',
      '\tif (i <= 1) return i;',
      '\treturn fib(i - 1) + fib(i - 2);',
      '}'
    ].join('\n');

    var result = highlight(str, {tab: '  ', lang: 'js'});

    result.should.eql([
      '<figure class="highlight js"><table><tr>',
      gutter(1, 4),
      code(str.replace(/\t/g, '  '), 'js'),
      end
    ].join(''));
  });

  it('escape html entity', function() {
    var str = [
      'deploy:',
      '  type: git',
      '  repo: <repository url>',
      '  branch: [branch]',
      '  message: [message]'
    ].join('\n');

    var result = highlight(str);
    result.should.include('&lt;repository url&gt;');
  });

  it('parse multi-line strings correctly', function() {
    var str = [
      'var string = `',
      '  Multi',
      '  line',
      '  string',
      '`'
    ].join('\n');

    var result = highlight(str, {lang: 'js'});
    result.should.eql([
      '<figure class="highlight js"><table><tr>',
      gutter(1, 5),
      code(str, 'js'),
      end
    ].join(''));
  });
});
