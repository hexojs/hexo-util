import chai from 'chai';
import escapeHTML from '../lib/escape_html.js';
import prismHighlight from '../lib/prism.js';
import stripIndent from 'strip-indent';

chai.should();

/**
 * Validates the given HTML string using html-tag-validator, allowing 'aria-hidden' on <span> tags.
 * Uses dynamic import for ESM compatibility and returns a Promise that resolves if valid, rejects on error.
 *
 * @param str - The HTML string to validate.
 * @returns A Promise that resolves if the HTML is valid, or rejects with an error.
 */
async function validateHtmlAsync(str: string): Promise<void> {
  // Use dynamic import for html-tag-validator to avoid type issues in ESM/TS
  const htmlTagValidatorModule = await import('html-tag-validator');
  let htmlTagValidator;
  if (typeof htmlTagValidatorModule === 'function') {
    htmlTagValidator = htmlTagValidatorModule;
  } else if (typeof htmlTagValidatorModule.default === 'function') {
    htmlTagValidator = htmlTagValidatorModule.default;
  } else {
    htmlTagValidator = undefined;
  }
  if (!htmlTagValidator) throw new Error('html-tag-validator is not a function');
  return await new Promise<void>((resolve, reject) => {
    htmlTagValidator(
      str,
      {
        attributes: {
          // 'aria-hidden' is used at <span> for line number
          // Even MDN website itself uses 'aria-hidden' at <span> tag
          // So I believe it is ok to whitelist this
          span: { normal: ['aria-hidden'] }
        }
      },
      (err, ast) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      }
    );
  });
}

const endTag = '</code></pre>';
const lineNumberStartTag = '<span aria-hidden="true" class="line-numbers-rows">';
const highlightToken = '<span class="token ';

describe('prismHighlight', () => {
  it('default (plain text)', async () => {
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
    result.should.contains(escapeHTML(stripIndent(input)));
    result.should.not.contains(highlightToken);

    await validateHtmlAsync(result);
  });

  it('str must be a string', () => {
    prismHighlight.should.throw('str must be a string!');
  });

  it('lineNumber disabled', async () => {
    const input = `
    {
      "foo": 1,
      "bar": 2
    }`;
    const result = prismHighlight(input, { lineNumber: false });

    // Line Number
    result.should.not.contains(lineNumberStartTag);

    await validateHtmlAsync(result);
  });

  it('tab - replace \\t', async () => {
    const input = ['function fib(i){', '\tif (i <= 1) return i;', '\treturn fib(i - 1) + fib(i - 2);', '}'].join('\n');

    // Use language: 'plain-text' for not supported language with Prism
    const result = prismHighlight(input, { tab: '  ', lang: 'plain-text' });

    result.should.contains(escapeHTML(input.replace(/\t/g, '  ')));

    await validateHtmlAsync(result);
  });

  it('language - javascript (loaded by default)', async () => {
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
    result.should.contains('<pre class="line-numbers language-javascript" data-language="javascript">');
    result.should.contains('<code class="language-javascript');
    // End Tag
    result.should.contains(endTag);
    // Line Number
    result.should.contains(lineNumberStartTag);
    // Being highlighted
    result.should.contains(highlightToken);

    await validateHtmlAsync(result);
  });

  it('language - haml (prismjs/components/)', async () => {
    const input = '= [\'hi\', \'there\', \'reader!\'].join " "';

    const result = prismHighlight(input, { lang: 'haml' });

    // Start Tag
    result.should.contains('<pre class="line-numbers language-haml" data-language="haml">');
    result.should.contains('<code class="language-haml');
    // End Tag
    result.should.contains(endTag);
    // Line Number
    result.should.contains(lineNumberStartTag);
    // Being highlighted
    result.should.contains(highlightToken);

    await validateHtmlAsync(result);
  });

  it('language - ts (an alias for typescript)', async () => {
    const input = 'const a: string = "";';

    const result = prismHighlight(input, { lang: 'ts' });

    // Start Tag
    result.should.contains('<pre class="line-numbers language-typescript" data-language="typescript">');
    result.should.contains('<code class="language-typescript');
    // End Tag
    result.should.contains(endTag);
    // Line Number
    result.should.contains(lineNumberStartTag);
    // Being highlighted
    result.should.contains(highlightToken);

    await validateHtmlAsync(result);
  });

  it('language - unsupported by prism', async () => {
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
    result.should.contains('<pre class="line-numbers language-brainfuck-foo-bar" data-language="brainfuck-foo-bar">');
    result.should.contains('<code class="language-brainfuck-foo-bar');
    // End Tag
    result.should.contains(endTag);
    // Line Number
    result.should.contains(lineNumberStartTag);
    // Code should only be escaped.
    result.should.contains(escapeHTML(stripIndent(input)));
    result.should.not.contains(highlightToken);

    await validateHtmlAsync(result);
  });

  it('isPreprocess - false', async () => {
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
    result.should.contains('<pre class="line-numbers language-javascript" data-language="javascript">');
    result.should.contains('<code class="language-javascript');
    // End Tag
    result.should.contains(endTag);
    // Line Number
    result.should.not.contains(lineNumberStartTag);
    // Being highlighted
    result.should.not.contains(highlightToken);

    await validateHtmlAsync(result);
  });

  it('mark', async () => {
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

    // isPreprocess - true (mark should be disabled)
    const result1 = prismHighlight(input, { lang: 'brainfuck', isPreprocess: true, mark: '1,3-6,10' });
    // Start Tag
    result1.should.contains('<pre class="line-numbers language-brainfuck" data-language="brainfuck">');

    // isPreprocess - false
    const result2 = prismHighlight(input, { lang: 'brainfuck', isPreprocess: false, mark: '1,3-6,10' });
    // Start Tag
    result2.should.contains(
      '<pre class="line-numbers language-brainfuck" data-language="brainfuck" data-line="1,3-6,10">'
    );

    // Only validate the result2
    await validateHtmlAsync(result2);
  });

  it('firstLine', async () => {
    const input = ['function fib(i){', '  if (i <= 1) return i;', '  return fib(i - 1) + fib(i - 2);', '}'].join('\n');

    const result1 = prismHighlight(input, { lang: 'js', isPreprocess: false, lineNumber: true, firstLine: -5 });
    result1.should.contains(
      '<pre class="line-numbers language-javascript" data-language="javascript" data-start="-5">'
    );

    // isPreprocess - true (firstLine should be disabled)
    const result2 = prismHighlight(input, { lang: 'js', isPreprocess: true, lineNumber: true, firstLine: -5 });
    result2.should.contains('<pre class="line-numbers language-javascript" data-language="javascript">');

    // lineNumber - false (firstLine should be disabled)
    const result3 = prismHighlight(input, { lang: 'js', isPreprocess: false, lineNumber: false, firstLine: -5 });
    result3.should.contains('<pre class="language-javascript" data-language="javascript">');

    // Only validate the result1
    await validateHtmlAsync(result1);
  });

  it('offset - mark & firstLine', async () => {
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

    // isPreprocess - true (mark should be disabled)
    const result1 = prismHighlight(input, { lang: 'brainfuck', isPreprocess: true, mark: '1,3-6,10', firstLine: -5 });
    // Start Tag
    result1.should.contains('<pre class="line-numbers language-brainfuck" data-language="brainfuck">');

    // isPreprocess - false
    const result2 = prismHighlight(input, { lang: 'brainfuck', isPreprocess: false, mark: '1,3-6,10', firstLine: -5 });
    // Start Tag
    result2.should.contains(
      '<pre class="line-numbers language-brainfuck" data-language="brainfuck" data-start="-5" data-line="1,3-6,10" data-line-offset="-6">'
    );

    // Only validate the result2
    await validateHtmlAsync(result2);
  });

  it('caption', async () => {
    const input = `
    {
      "foo": 1,
      "bar": 2
    }`;
    const caption = 'foo';
    const result = prismHighlight(input, { caption });

    result.should.contains('<div class="caption">' + caption + '</div>');

    await validateHtmlAsync(result);
  });
});
