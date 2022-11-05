'use strict';

require('chai').should();

describe('camelCaseKeys', () => {
  const camelCaseKeys = require('../lib/camel_case_keys');

  it('default', () => {
    const result = camelCaseKeys({
      foo_bar: 'test'
    });

    result.should.eql({
      foo_bar: 'test',
      fooBar: 'test'
    });
  });

  it('obj must be an object', () => {
    camelCaseKeys.should.throw('obj must be an object!');
  });

  it('setter', () => {
    const result = camelCaseKeys({
      foo_bar: 'test'
    });

    result.foo_bar = 'new';
    result.fooBar.should.eql('new');
  });

  it('ignore prefixing underscore', () => {
    const result = camelCaseKeys({
      _foo_bar: 'test',
      __bar_baz: 'foo'
    });

    result.should.eql({
      _fooBar: 'test',
      _foo_bar: 'test',
      __barBaz: 'foo',
      __bar_baz: 'foo'
    });
  });

  it('do nothing if the key is camelCase', () => {
    const result = camelCaseKeys({ fooBar: 'test' });
    result.should.eql({ fooBar: 'test' });
  });
});
