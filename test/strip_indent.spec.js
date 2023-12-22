'use strict';

const stripIndent = require('../dist/strip_indent');

describe('stripIndent', () => {
  it('default', () => {
    const text = '\tunicorn\n\t\tcake';

    stripIndent(text).should.eql('unicorn\n\tcake');
  });
});
