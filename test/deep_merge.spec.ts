import chai from 'chai';
import deepMerge from '../lib/deep_merge';
chai.should();

// The test is modified based on https://github.com/jonschlinkert/merge-deep/blob/master/test.js

describe('deepMerge()', () => {
  it('should act as lodash.merge', () => {
    const obj1: any = { 'a': [{ 'b': 2 }, { 'd': 4 }] };
    const obj2: any = { 'a': [{ 'c': 3 }, { 'e': 5 }] };

    const expected = { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] };
    const result: any = deepMerge(obj1, obj2);
    result.should.eql(expected);
  });

  it('should do a deep merge', () => {
    const obj1: any = {a: {b: 1, c: 1, d: {e: 1, f: 1}}};
    const obj2: any = {a: {b: 2, d: {f: 'f'} }};

    const expected = {a: {b: 2, c: 1, d: {e: 1, f: 'f'} }};
    const result: any = deepMerge(obj1, obj2);
    result.should.eql(expected);
  });

  it('should not merge strings', () => {
    const obj1: any = {a: 'fooo'};
    const obj2: any = {a: {b: 2, d: {f: 'f'} }};
    const obj3: any = {a: 'bar'};

    const result: any = deepMerge(deepMerge(obj1, obj2), obj3);
    result.a.should.eql('bar');
  });

  it('should merge simple array', () => {
    const obj1 = {a: [1, [2, 3], 4]};
    const obj2 = {a: [1, [3, 4], [5, 6], 6]};

    const result = deepMerge(obj1, obj2);
    const expected = {a: [1, [2, 3, 4], [5, 6], 6]};

    result.should.eql(expected);
  });

  it('should not merge an objects into an array', () => {
    const obj1: any = {a: {b: 1}};
    const obj2: any = {a: ['foo', 'bar']};

    const result: any = deepMerge(obj1, obj2);
    result.should.eql({a: ['foo', 'bar']});
  });

  it('should not affect target & source', () => {
    const obj1 = {a: 0, b: 1, c: {d: 1}, e: 4};
    const obj2 = {b: 3, c: {d: 2}};

    const result = deepMerge(obj1, obj2);
    const expected = {a: 0, b: 3, c: {d: 2}, e: 4};

    result.should.eql(expected);

    result.should.not.eql(obj1);
    obj1.should.eql({a: 0, b: 1, c: {d: 1}, e: 4});

    result.should.not.eql(obj2);
    obj2.should.eql({b: 3, c: {d: 2}});
  });

  it('should deep clone arrays during merge', () => {
    const obj1: any = {a: [1, 2, [3, 4]]};
    const obj2: any = {b: [5, 6]};

    const result: any = deepMerge(obj1, obj2);

    result.a.should.eql([1, 2, [3, 4]]);
    result.a[2].should.eql([3, 4]);
    result.b.should.eql(obj2.b);
  });
});
