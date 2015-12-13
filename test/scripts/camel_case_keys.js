'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('camelCaseKeys', function() {
  var camelCaseKeys = require('../../lib/camel_case_keys');

  it('default', function() {
    var result = camelCaseKeys({
      foo_bar: 'test'
    });

    result.should.eql({
      foo_bar: 'test',
      fooBar: 'test'
    });
  });

  it('obj must be an object', function() {
    try {
      camelCaseKeys();
    } catch (err) {
      err.should.have.property('message', 'obj must be an object!');
    }
  });

  it('setter', function() {
    var result = camelCaseKeys({
      foo_bar: 'test'
    });

    result.foo_bar = 'new';
    result.fooBar.should.eql('new');
  });

  it('ignore prefixing underscore', function() {
    var result = camelCaseKeys({
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

  it('do nothing if the key is camelCase', function() {
    var result = camelCaseKeys({
      fooBar: 'test'
    });

    result.should.eql({
      fooBar: 'test'
    });
  });
});
