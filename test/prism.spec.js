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

describe('highlight', () => {
  const prismHighlight = require('../lib/prism');

  it('default (plain text)', done => {
    const input = `
    {
      "foo": 1,
      "bar": 2
    }`;
    const result = prismHighlight(input);

    // Start Tag
    result.should.contains('<pre class="line-numbers language-plain">');
    result.should.contains('<code class="language-plain');
    // End Tag
    result.should.contains(endTag);
    // Line Number
    result.should.contains(lineNumberStartTag);
    // Code should only be escaped.
    result.should.contains(escapeHTML(input));

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

  it('language - javascript (supported by prism)', done => {
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

    const result = prismHighlight(input, { language: 'js' });

    // Start Tag
    result.should.contains('<pre class="line-numbers language-js">');
    result.should.contains('<code class="language-js');
    // End Tag
    result.should.contains(endTag);
    // Line Number
    result.should.contains(lineNumberStartTag);

    validateHtmlAsync(result, done);
  });

  it('language - brainfuck (unsupported by prism)', done => {
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

    const result = prismHighlight(input, { language: 'brainfuck' });

    // Start Tag
    result.should.contains('<pre class="line-numbers language-brainfuck">');
    result.should.contains('<code class="language-brainfuck');
    // End Tag
    result.should.contains(endTag);
    // Line Number
    result.should.contains(lineNumberStartTag);
    // Code should only be escaped.
    result.should.contains(escapeHTML(input));

    validateHtmlAsync(result, done);
  });
});
