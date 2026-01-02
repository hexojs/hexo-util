const STATE_PLAINTEXT = 0;
const STATE_HTML = 1;
const STATE_COMMENT = 2;

const CHAR_LT = 60; // '<'
const CHAR_GT = 62; // '>'
const CHAR_QUOTE = 34; // '"'
const CHAR_APOS = 39; // "'"
const CHAR_DASH = 45; // '-'
const CHAR_SPACE = 32; // ' '
const CHAR_NEWLINE = 10; // '\n'
const CHAR_EXCLAIM = 33; // '!'

// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
function striptags(html: string | String = '') {
  // if not string, then safely return an empty string
  if (typeof html !== 'string' && !(html instanceof String)) {
    return '';
  }

  let state = STATE_PLAINTEXT;
  let depth = 0;
  let in_quote_char = 0;
  let output = '';
  let tag_start = -1;
  let plain_text_start = 0;

  const { length } = html;

  for (let idx = 0; idx < length; idx++) {
    const charCode = html.charCodeAt(idx);

    if (state === STATE_PLAINTEXT) {
      if (charCode === CHAR_LT) {
        output += html.slice(plain_text_start, idx);
        state = STATE_HTML;
        tag_start = idx;
      }
    } else if (state === STATE_HTML) {
      if (charCode === CHAR_LT) {
        // ignore '<' if inside a quote
        if (!in_quote_char) depth++;
      } else if (charCode === CHAR_GT) {
        // ignore '>' if inside a quote
        if (!in_quote_char) {
          if (depth) {
            depth--;
          } else {
            // this is closing the tag in tag_buffer
            in_quote_char = 0;
            state = STATE_PLAINTEXT;
            tag_start = -1;
            plain_text_start = idx + 1;
          }
        }
      } else if (charCode === CHAR_QUOTE || charCode === CHAR_APOS) {
        // catch both single and double quotes

        if (charCode === in_quote_char) {
          in_quote_char = 0;
        } else {
          in_quote_char = in_quote_char || charCode;
        }
      } else if (charCode === CHAR_DASH) {
        // same as if (html.slice(tag_start, idx) === '<!-') {
        if (idx - tag_start === 3
          && html.charCodeAt(tag_start + 1) === CHAR_EXCLAIM
          && html.charCodeAt(tag_start + 2) === CHAR_DASH
        ) {
          state = STATE_COMMENT;
        }
      } else if (charCode === CHAR_SPACE || charCode === CHAR_NEWLINE) {
        // same as if (html.slice(tag_start, idx) === '<') {
        if (idx - tag_start === 1) {
          state = STATE_PLAINTEXT;
          output += '< ';
          tag_start = -1;
          plain_text_start = idx + 1;
        }
      }
    } else if (state === STATE_COMMENT) {
      if (charCode === CHAR_GT) {
        // same as if (html.slice(idx - 2, idx) === '--') {
        if (idx >= 2
            && html.charCodeAt(idx - 1) === CHAR_DASH
            && html.charCodeAt(idx - 2) === CHAR_DASH) {
          // close the comment
          state = STATE_PLAINTEXT;
          plain_text_start = idx + 1;
        }
        tag_start = -1;
      }
    }
  }

  if (state === STATE_PLAINTEXT && plain_text_start < length) {
    output += html.slice(plain_text_start);
  }

  return output;
}

export = striptags;
