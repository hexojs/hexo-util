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

  it('should handle Date type', () => {
    const date1 = new Date('2020-01-01T00:00:00Z');
    const date2 = new Date('2022-01-01T00:00:00Z');
    const obj1 = { date: date1 };
    const obj2 = { date: date2 };
    const result = deepMerge(obj1, obj2);
    result.date.getTime().should.eql(date2.getTime());
    result.date.should.not.equal(date1);
    result.date.should.not.equal(date2); // Should be a clone
  });

  it('should handle RegExp type', () => {
    const reg1 = /foo/g;
    const reg2 = /bar/i;
    const obj1 = { regexp: reg1 };
    const obj2 = { regexp: reg2 };
    const result = deepMerge(obj1, obj2);
    result.regexp.source.should.eql(reg2.source);
    result.regexp.flags.should.eql(reg2.flags);
    result.regexp.should.not.equal(reg1);
    result.regexp.should.not.equal(reg2); // Should be a clone
  });

  it('should handle Map type', () => {
    const map1 = new Map<number, any>([[1, {a: 1}], [2, {b: 2}]]);
    const map2 = new Map<number, any>([[2, {b: 3}], [3, {c: 4}]]);
    const obj1 = { map: map1 };
    const obj2 = { map: map2 };
    const result = deepMerge(obj1, obj2);
    Array.from(result.map.keys()).should.eql([1, 2, 3]);
    result.map.get(1).should.eql({a: 1});
    result.map.get(2).should.eql({b: 3});
    result.map.get(3).should.eql({c: 4});
    result.map.should.not.equal(map1);
    result.map.should.not.equal(map2);
  });

  it('should handle Set type', () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([3, 4, 5]);
    const obj1 = { set: set1 };
    const obj2 = { set: set2 };
    const result = deepMerge(obj1, obj2);
    Array.from(result.set).sort().should.eql([1, 2, 3, 4, 5]);
    result.set.should.not.equal(set1);
    result.set.should.not.equal(set2);
  });

  it('should handle Function type', () => {
    const fn1 = function() { return 1; };
    const fn2 = function() { return 2; };
    const obj1 = { fn: fn1 };
    const obj2 = { fn: fn2 };
    const result = deepMerge(obj1, obj2);
    result.fn.should.equal(fn2);
  });
});
