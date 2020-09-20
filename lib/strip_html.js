'use strict';

const STATE_PLAINTEXT = Symbol('plaintext');
const STATE_HTML = Symbol('html');
const STATE_COMMENT = Symbol('comment');

function striptags(html = '') {
  let state = STATE_PLAINTEXT;
  let tag_buffer = '';
  let depth = 0;
  let in_quote_char = '';
  let output = '';

  const { length } = html;

  for (let idx = 0; idx < length; idx++) {
    const char = html[idx];

    if (state === STATE_PLAINTEXT) {
      switch (char) {
        case '<':
          state = STATE_HTML;
          tag_buffer = tag_buffer + char;
          break;

        default:
          output += char;
          break;
      }
    } else if (state === STATE_HTML) {
      switch (char) {
        case '<':
          // ignore '<' if inside a quote
          if (in_quote_char) break;

          // we're seeing a nested '<'
          depth++;
          break;

        case '>':
          // ignore '>' if inside a quote
          if (in_quote_char) {
            break;
          }

          // something like this is happening: '<<>>'
          if (depth) {
            depth--;

            break;
          }

          // this is closing the tag in tag_buffer
          in_quote_char = '';
          state = STATE_PLAINTEXT;
          // tag_buffer += '>';

          tag_buffer = '';
          break;

        case '"':
        case '\'':
          // catch both single and double quotes

          if (char === in_quote_char) {
            in_quote_char = '';
          } else {
            in_quote_char = in_quote_char || char;
          }

          tag_buffer = tag_buffer + char;
          break;

        case '-':
          if (tag_buffer === '<!-') {
            state = STATE_COMMENT;
          }

          tag_buffer = tag_buffer + char;
          break;

        case ' ':
        case '\n':
          if (tag_buffer === '<') {
            state = STATE_PLAINTEXT;
            output += '< ';
            tag_buffer = '';

            break;
          }

          tag_buffer = tag_buffer + char;
          break;

        default:
          tag_buffer = tag_buffer + char;
          break;
      }
    } else if (state === STATE_COMMENT) {
      switch (char) {
        case '>':
          if (tag_buffer.slice(-2) === '--') {
            // close the comment
            state = STATE_PLAINTEXT;
          }

          tag_buffer = '';
          break;

        default:
          tag_buffer = tag_buffer + char;
          break;
      }
    }
  }

  return output;
}

module.exports = striptags;
