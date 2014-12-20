module.exports = function(tag, attrs, text){
  var result = '<' + tag;

  for (var i in attrs){
    if (attrs[i]) result += ' ' + i + '="' + attrs[i] + '"';
  }

  result += text == null ? '>' : '>' + text + '</' + tag + '>';

  return result;
};