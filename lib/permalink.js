var escape = require('./escape');

var rParam = /:(\w+)/g;

function Permalink(rule, options){
  var segments = options.segments || {};
  var params = [];

  var regex = escape.regex(rule)
    .replace(rParam, function(match, name){
      params.push(name);

      if (segments.hasOwnProperty(name)){
        var segment = segments[name];

        if (segment instanceof RegExp){
          return segment.source;
        } else {
          return segment;
        }
      } else {
        return '(.+?)';
      }
    });

  this.rule = rule;
  this.regex = new RegExp('^' + regex + '$');
  this.params = params;
}

Permalink.prototype.test = function(str){
  return this.regex.test(str);
};

Permalink.prototype.parse = function(str){
  var match = str.match(this.regex),
    params = this.params,
    result = {};

  if (!match) return;

  for (var i = 1, len = match.length; i < len; i++){
    result[params[i - 1]] = match[i];
  }

  return result;
};

Permalink.prototype.stringify = function(data){
  return this.rule.replace(rParam, function(match, name){
    return data[name];
  });
};

Permalink.parse = function(rule, str){
  return new Permalink(rule).parse(str);
};

Permalink.stringify = function(rule, data){
  return new Permalink(rule).stringify(data);
};

module.exports = Permalink;