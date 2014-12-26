var inflection = require('inflection');

exports.escape = require('./escape');
exports.format = require('./format');
exports.highlight = require('./highlight');
exports.htmlTag = exports.html_tag = require('./html_tag');
exports.Pattern = require('./pattern');
exports.Permalink = require('./permalink');
exports.inflector = inflection;
exports.titlecase = inflection.titleize;