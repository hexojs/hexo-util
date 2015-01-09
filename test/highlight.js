var should = require('chai').should();
var hljs = require('highlight.js');

var testJson = {
  foo: 1,
  bar: 2
};

var testString = JSON.stringify(testJson, null, '  ');

var start = '<figure class="highlight json"><table><tr>';
var end = '</tr></table></figure>';

var gutterStart = '<td class="gutter"><pre>';
var gutterEnd = '</pre></td>';

var codeStart = '<td class="code"><pre>';
var codeEnd = '</pre></td>';

function gutter(start, end){
  var result = gutterStart;

  for (var i = start; i <= end; i++){
    result += '<span class="line">' + i + '</span>\n';
  }

  result += gutterEnd;

  return result;
}

function code(str, lang){
  var data;

  if (lang){
    data = hljs.highlight(lang.toLowerCase(), str);
  } else {
    data = hljs.highlightAuto(str);
  }

  var lines = data.value.split('\n');
  var result = codeStart;

  for (var i = 0, len = lines.length; i < len; i++){
    result += '<span class="line">' + lines[i] + '</span>\n';
  }

  result += codeEnd;

  return result;
}

function assertResult(result){
  var expected = start;

  for (var i = 1, len = arguments.length; i < len; i++){
    expected += arguments[i];
  }

  expected += end;

  result.should.eql(expected);
}

describe('highlight', function(){
  var highlight = require('../lib/highlight');

  it('default', function(){
    var result = highlight(testString);
    assertResult(result, gutter(1, 4), code(testString));
  });

  it('str must be a string', function(){
    try {
      highlight();
    } catch (err){
      err.should.have.property('message', 'str must be a string!');
    }
  });

  it('gutter: false', function(){
    var result = highlight(testString, {gutter: false});
    assertResult(result, code(testString));
  });

  it('wrap: false', function(){
    var result = highlight(testString, {wrap: false});
    result.should.eql(hljs.highlightAuto(testString).value);
  });

  it('firstLine', function(){
    var result = highlight(testString, {firstLine: 3});
    assertResult(result, gutter(3, 6), code(testString));
  });

  it('lang');

  it('caption', function(){
    var result = highlight(testString, {caption: 'hello world'});

    result.should.eql([
      '<figure class="highlight json"><figcaption>hello world</figcaption><table><tr>',
      gutter(1, 4),
      code(testString),
      end
    ].join(''));
  });

  it('tab', function(){
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
});