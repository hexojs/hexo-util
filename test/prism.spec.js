'use strict';

require('chai').should();
const escapeHTML = require('../lib/escape_html');

const validator = require('html-tag-validator');
function validateHtmlAsync(str, done) {
  validator(str, {
    'attributes': {
      // 'aria-hidden' is used at <span> for line number
      // Even MDN website itself uses 'aria-hidden' at <span> tag
      // So I believe it is ok to whitelist this
      'span': { 'normal': ['aria-hidden'] }
    }
  }, (err, ast) => {
    if (err) {
      done(err);
    } else {
      done();
    }
  });
}

const endTag = '</code></pre>';
const lineNumberStartTag = '<span aria-hidden="true" class="line-numbers-rows">';
const highlightToken = '<span class="token ';

describe('prismHighlight', () => {
  const prismHighlight = require('../lib/prism');

  it('default (plain text)', done => {
    const input = `
    {
      "foo": 1,
      "bar": 2
    }`;
    const result = prismHighlight(input);

    // Start Tag
    result.should.contains('<pre class="line-numbers language-none">');
    result.should.contains('<code class="language-none');
    // End Tag
    result.should.contains(endTag);
    // Line Number
    result.should.contains(lineNumberStartTag);
    // Code should only be escaped.
    result.should.contains(escapeHTML(input));
    result.should.not.contains(highlightToken);

    validateHtmlAsync(result, done);
  });

  it('str must be a string', () => {
    prismHighlight.should.throw('str must be a string!');
  });

  it('lineNumber disabled', done => {
    const input = `
    {
      "foo": 1,
      "bar": 2
    }`;
    const result = prismHighlight(input, { lineNumber: false });

    // Line Number
    result.should.not.contains(lineNumberStartTag);

    validateHtmlAsync(result, done);
  });

  it('tab - replace \\t', done => {
    const input = [
      'function fib(i){',
      '\tif (i <= 1) return i;',
      '\treturn fib(i - 1) + fib(i - 2);',
      '}'
    ].join('\n');

    // Use language: 'plain' to simplify the test
    const result = prismHighlight(input, { tab: '  ', lang: 'plain' });

    result.should.contains(escapeHTML(input.replace(/\t/g, '  ')));

    validateHtmlAsync(result, done);
  });

  it('language - javascript (loaded by default)', done => {
    const input = `
      const Prism = require('prismjs');
      /**
        * Wrapper of Prism.highlight()
        * @param {String} code
        * @param {String} language
        */
      function prismHighlight(code, language) {
        // Prism has not load the language pattern
        if (!Prism.languages[language]) prismLoadLanguages(language);

        if (Prism.languages[language]) {
            // Prism escapes output by default
            return Prism.highlight(unescapeHTML(code), Prism.languages[language], language);
        }

        // Current language is not supported by Prism, return origin code;
        return escapeHTML(code);
      }`;

    const result = prismHighlight(input, { lang: 'js' });

    // Start Tag
    result.should.contains('<pre class="line-numbers language-js">');
    result.should.contains('<code class="language-js');
    // End Tag
    result.should.contains(endTag);
    // Line Number
    result.should.contains(lineNumberStartTag);
    // Being highlighted
    result.should.contains(highlightToken);

    validateHtmlAsync(result, done);
  });

  it('language - haml (prismjs/components/)', done => {
    const input = '= [\'hi\', \'there\', \'reader!\'].join " "';

    const result = prismHighlight(input, { lang: 'haml' });

    // Start Tag
    result.should.contains('<pre class="line-numbers language-haml">');
    result.should.contains('<code class="language-haml');
    // End Tag
    result.should.contains(endTag);
    // Line Number
    result.should.contains(lineNumberStartTag);
    // Being highlighted
    result.should.contains(highlightToken);

    validateHtmlAsync(result, done);
  });

  it('language - unsupported by prism', done => {
    const input = `
      [ yet another pi calculation program in bf

        Just like for pi16.b the accuracy of the result depends on the cellsize:

         - using  8 bit cells causes an overflow after 4 digits
         - using 16 bit cells causes an overflow after 537 digits
         - using 32 bit cells causes an overflow after several millions of digits

        It's about ~38 times shorter than pi16.b, ~364 times faster and works with
        not-wrapping (bignum) implementations. 

        by Felix Nawothnig (felix.nawothnig@t-online.de) ]

      >  +++++ +++++ +++++ (15 digits)

      [<+>>>>>>>>++++++++++<<<<<<<-]>+++++[<+++++++++>-]+>>>>>>+[<<+++[>>[-<]<[>]<-]>>
      [>+>]<[<]>]>[[->>>>+<<<<]>>>+++>-]<[<<<<]<<<<<<<<+[->>>>>>>>>>>>[<+[->>>>+<<<<]>
      >>>>]<<<<[>>>>>[<<<<+>>>>-]<<<<<-[<<++++++++++>>-]>>>[<<[<+<<+>>>-]<[>+<-]<++<<+
      >>>>>>-]<<[-]<<-<[->>+<-[>>>]>[[<+>-]>+>>]<<<<<]>[-]>+<<<-[>>+<<-]<]<<<<+>>>>>>>
      >[-]>[<<<+>>>-]<<++++++++++<[->>+<-[>>>]>[[<+>-]>+>>]<<<<<]>[-]>+>[<<+<+>>>-]<<<
      <+<+>>[-[-[-[-[-[-[-[-[-<->[-<+<->>]]]]]]]]]]<[+++++[<<<++++++++<++++++++>>>>-]<
      <<<+<->>>>[>+<<<+++++++++<->>>-]<<<<<[>>+<<-]+<[->-<]>[>>.<<<<[+.[-]]>>-]>[>>.<<
      -]>[-]>[-]>>>[>>[<<<<<<<<+>>>>>>>>-]<<-]]>>[-]<<<[-]<<<<<<<<]++++++++++.`;

    // prismjs supports brainfuck, so specify a 'brainfuck-foo-bar' to trigger unsupported
    const result = prismHighlight(input, { lang: 'brainfuck-foo-bar' });

    // Start Tag
    result.should.contains('<pre class="line-numbers language-brainfuck-foo-bar">');
    result.should.contains('<code class="language-brainfuck-foo-bar');
    // End Tag
    result.should.contains(endTag);
    // Line Number
    result.should.contains(lineNumberStartTag);
    // Code should only be escaped.
    result.should.contains(escapeHTML(input));
    result.should.not.contains(highlightToken);

    validateHtmlAsync(result, done);
  });

  it('isPreprocess - false', done => {
    const input = `
      const Prism = require('prismjs');
      /**
        * Wrapper of Prism.highlight()
        * @param {String} code
        * @param {String} language
        */
      function prismHighlight(code, language) {
        // Prism has not load the language pattern
        if (!Prism.languages[language]) prismLoadLanguages(language);

        if (Prism.languages[language]) {
            // Prism escapes output by default
            return Prism.highlight(unescapeHTML(code), Prism.languages[language], language);
        }

        // Current language is not supported by Prism, return origin code;
        return escapeHTML(code);
      }`;

    const result = prismHighlight(input, { lang: 'js', isPreprocess: false });

    // Start Tag
    result.should.contains('<pre class="line-numbers language-js">');
    result.should.contains('<code class="language-js');
    // End Tag
    result.should.contains(endTag);
    // Line Number
    result.should.not.contains(lineNumberStartTag);
    // Being highlighted
    result.should.not.contains(highlightToken);

    validateHtmlAsync(result, done);
  });
});
