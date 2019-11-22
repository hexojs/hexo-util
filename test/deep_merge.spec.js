'use strict';

require('chai').should();

// The test is modified based on https://github.com/jonschlinkert/merge-deep/blob/master/test.js

describe('deepMerge()', () => {
  const deepMerge = require('../lib/deep_merge');

  it('should merge object properties without affecting any object', () => {
    const obj1 = {a: 0, b: 1};
    const obj2 = {c: 2, b: 3};

    const result = deepMerge(obj1, obj2);
    const expected = {a: 0, b: 3, c: 2 };

    result.should.eql(expected);
    result.should.not.eql(obj1);
    result.should.not.eql(obj2);
  });

  it('should do a deep merge', () => {
    const obj1 = {a: {b: 1, c: 1, d: {e: 1, f: 1}}};
    const obj2 = {a: {b: 2, d: {f: 'f'} }};

    const expected = {a: {b: 2, c: 1, d: {e: 1, f: 'f'} }};

    deepMerge(obj1, obj2).should.eql(expected);
  });

  it('should not merge strings', () => {
    const obj1 = {a: 'fooo'};
    const obj2 = {a: {b: 2, d: {f: 'f'} }};
    const obj3 = {a: 'bar'};

    const result = deepMerge(deepMerge(obj1, obj2), obj3);
    result.a.should.eql('bar');
  });

  it('should shallow clone objects during merge', () => {
    const obj1 = {a: {b: 1}};
    const obj2 = {a: {c: 2}};

    const result = deepMerge(obj1, obj2);

    result.should.eql({a: {b: 1, c: 2}});
    result.a.should.not.eql(obj1.a);
    result.a.should.eql(obj2.a);
  });

  it('should not merge an objects into an array', () => {
    const obj1 = {a: {b: 1}};
    const obj2 = {a: ['foo', 'bar']};

    deepMerge(obj1, obj2).should.eql({a: ['foo', 'bar']});
  });

  it('should deep clone arrays during merge', () => {
    const obj1 = {a: [1, 2, [3, 4]]};
    const obj2 = {b: [5, 6]};

    const result = deepMerge(obj1, obj2);

    result.a.should.eql([1, 2, [3, 4]]);
    result.a[2].should.eql([3, 4]);
    result.b.should.eql(obj2.b);
  });
});
