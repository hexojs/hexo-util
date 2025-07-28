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

  it('should handle thousands of circular references', () => {
    // Create 1000 objects with circular references and multiple types
    const arr1: any[] = [];
    const arr2: any[] = [];
    for (let i = 0; i < 1000; i++) {
      arr1[i] = {
        idx: i,
        date: new Date(2020, 0, i + 1),
        regexp: new RegExp(`foo${i}`, i % 2 ? 'g' : 'i'),
        map: new Map([[i, { val: i }]]),
        set: new Set([i, i + 1]),
        fn: function() { return i; }
      };
      arr2[i] = {
        idx: i,
        date: new Date(2021, 0, i + 1),
        regexp: new RegExp(`bar${i}`, i % 2 ? 'i' : 'g'),
        map: new Map([[i, { val: i * 2 }]]),
        set: new Set([i, i + 2]),
        fn: function() { return i * 2; }
      };
    }
    // Add circular references
    for (let i = 0; i < 1000; i++) {
      arr1[i].self = arr1[i];
      arr2[i].self = arr2[i];
      if (i > 0) {
        arr1[i].prev = arr1[i - 1];
        arr2[i].prev = arr2[i - 1];
      }
    }
    const obj1 = { arr: arr1 };
    const obj2 = { arr: arr2 };
    const result = deepMerge(obj1, obj2);
    // Check merged array length
    result.arr.length.should.eql(1000);
    // Check circular references and types are preserved and not the same as original
    for (let i = 0; i < 1000; i++) {
      result.arr[i].should.have.property('idx', i);
      result.arr[i].should.have.property('self');
      result.arr[i].self.should.equal(result.arr[i]);
      if (i > 0) {
        result.arr[i].should.have.property('prev');
        result.arr[i].prev.should.equal(result.arr[i - 1]);
      }
      // Should not be the same object as arr1 or arr2
      result.arr[i].should.not.equal(arr1[i]);
      result.arr[i].should.not.equal(arr2[i]);
      // Check Date
      result.arr[i].date.getTime().should.eql(arr2[i].date.getTime());
      result.arr[i].date.should.not.equal(arr1[i].date);
      result.arr[i].date.should.not.equal(arr2[i].date);
      // Check RegExp
      result.arr[i].regexp.source.should.eql(arr2[i].regexp.source);
      result.arr[i].regexp.flags.should.eql(arr2[i].regexp.flags);
      result.arr[i].regexp.should.not.equal(arr1[i].regexp);
      result.arr[i].regexp.should.not.equal(arr2[i].regexp);
      // Check Map
      Array.from(result.arr[i].map.keys()).should.eql(Array.from(arr2[i].map.keys()));
      result.arr[i].map.get(i).should.eql({ val: i * 2 });
      result.arr[i].map.should.not.equal(arr1[i].map);
      result.arr[i].map.should.not.equal(arr2[i].map);
      // Check Set
      Array.from(result.arr[i].set).sort().should.eql(Array.from(new Set([...arr1[i].set, ...arr2[i].set])).sort());
      result.arr[i].set.should.not.equal(arr1[i].set);
      result.arr[i].set.should.not.equal(arr2[i].set);
      // Check Function
      result.arr[i].fn.should.equal(arr2[i].fn);
    }
  });
});
