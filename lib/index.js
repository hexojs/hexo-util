'use strict';

const hash = require('./hash');

exports.CacheStream = require('./cache_stream');
exports.camelCaseKeys = require('./camel_case_keys');
exports.Color = require('./color');
exports.createSha1Hash = hash.createSha1Hash;
exports.escapeDiacritic = require('./escape_diacritic');
exports.escapeHTML = require('./escape_html');
exports.escapeRegExp = require('./escape_regexp');
exports.hash = hash.hash;
exports.HashStream = hash.HashStream;
exports.highlight = require('./highlight');
exports.htmlTag = require('./html_tag');
exports.Pattern = require('./pattern');
exports.Permalink = require('./permalink');
exports.slugize = require('./slugize');
exports.spawn = require('./spawn');
exports.stripHTML = require('./strip_html');
exports.truncate = require('./truncate');
exports.wordWrap = require('./word_wrap');
