# util

[![Build Status](https://travis-ci.org/hexojs/util.svg?branch=master)](https://travis-ci.org/hexojs/util)  [![NPM version](https://badge.fury.io/js/hexo-util.svg)](http://badge.fury.io/js/hexo-util) [![Coverage Status](https://img.shields.io/coveralls/hexojs/util.svg)](https://coveralls.io/r/hexojs/util?branch=master)

Utilities for [Hexo].

## Installation

``` bash
$ npm install hexo-util --save
```

## Usage

``` js
var util = require('hexo-util');
```

### escape.filename(str, [transform])

Escapes special characters in a filename. Use `transform` argument to transform the string into lower case (`1`) or upper case (`2`).

### escpae.path(str, [transform])

Escapes special characters in a path. Use `transform` argument to convert the string into lower case (`1`) or upper case (`2`).

### escape.regex(str)

Escapes special characters in a regular expression.

### escape.diacritic(str)

Escapes diacritic characters in a string.

### escape.html(str)

Escapes HTML entities in a string.

### format.stripHTML(str)

Removes HTML tags in a string.

### format.trim(str)

Removes prefixing spaces and trailing spaces in a string.

### format.titlecase(str)

Converts a string into title case.

### format.wordWrap(str, [options])

Wraps the string no longer than line width. This method breaks on the first whitespace character that does not exceed line width.

Option | Description | Default
--- | --- | ---
`width` | Line width | 80

``` js
format.wordWrap('Once upon a time')
// Once upon a time

format.wordWrap('Once upon a time, in a kingdom called Far Far Away, a king fell ill, and finding a successor to the throne turned out to be more trouble than anyone could have imagined...')
// Once upon a time, in a kingdom called Far Far Away, a king fell ill, and finding\na successor to the throne turned out to be more trouble than anyone could have\nimagined...

format.wordWrap('Once upon a time', {width: 8})
// Once\nupon a\ntime

format.wordWrap('Once upon a time', {width: 1})
// Once\nupon\na\ntime
```

### format.truncate(str, [options])

Truncates a given text after a given `length` if text is longer than `length`. The last characters will be replaced with the `omission` option for a total length not exceeding `length`.

Option | Description | Default
--- | --- | ---
`length` | Max length of the string | 30
`omission` | Omission text | ...
`separator` | truncate text at a natural break | 

``` js
format.truncate('Once upon a time in a world far far away')
// "Once upon a time in a world..."

format.truncate('Once upon a time in a world far far away', {length: 17})
// "Once upon a ti..."

format.truncate('Once upon a time in a world far far away', {length: 17, separator: ' '})
// "Once upon a..."

format.truncate('And they found that many people were sleeping better.', {length: 25, omission: '... (continued)'})
// "And they f... (continued)"
```

### highlight(str, [options])

Syntax highlighting for a code block.

Option | Description | Default
--- | --- | ---
`gutter` | Whether to show line numbers | true
`wrap` | Whether to wrap the code block | true
`first_line` | First line number | 1
`lang` | Language (Auto detect if not defined) |
`caption` | Caption |
`tab`| Replace tabs |

### htmlTag(tag, attrs, text)

Creates a html tag.

``` js
htmlTag('img', {src: 'example.png'})
// <img src="example.png">

htmlTag('a', {href: 'http://hexo.io/'}, 'Hexo')
// <a href="http://hexo.io/">Hexo</a>
```

### Pattern(rule)

Parses the string and tests if the string matches the rule. `rule` can be a string, a regular expression or a function.

``` js
var pattern = new Pattern('posts/:id');

pattern.match('posts/89');
// {0: 'posts/89', 1: '89', id: '89'}
```

``` js
var pattern = new Pattern('posts/*path');

pattern.match('posts/2013/hello-world');
// {0: 'posts/2013/hello-world', 1: '2013/hello-world', path: '2013/hello-world'}
```

### Permalink(rule, [options])

Parses a permalink.

Option | Description
--- | ---
`segments` | Customize the rule of a segment in the permalink

``` js
var permalink = new Permalink(':year/:month/:day/:title', {
    segments: {
        year: /(\d{4})/,
        month: /(\d{2})/,
        day: /(\d{2})/
    }
});

permalink.parse('2014/01/31/test');
// {year: '2014', month: '01', day: '31', title: 'test'}

permalink.test('2014/01/31/test');
// true

permalink.stringify({year: '2014', month: '01', day: '31', title: 'test'})
// 2014/01/31/test
```

## License

MIT

[Hexo]: http://hexo.io/