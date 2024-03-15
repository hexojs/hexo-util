import stripIndent from '../lib/strip_indent';

describe('stripIndent', () => {
  it('default', () => {
    const text = '\tunicorn\n\t\tcake';

    stripIndent(text).should.eql('unicorn\n\tcake');
  });
});
