import chai from 'chai';
chai.should();
const expect = chai.expect;
import { jsonStringifyWithCircular, jsonParseWithCircular } from '../lib/json_stringify_circular';

describe('json_stringify_circular', () => {
  it('should stringify and parse a simple object', () => {
    const obj = { a: 1, b: 'test', c: true };
    const str = jsonStringifyWithCircular(obj);
    const parsed = jsonParseWithCircular<typeof obj>(str);
    expect(parsed).to.deep.equal(obj);
  });

  it('should handle circular references', () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    const str = jsonStringifyWithCircular(obj);
    const parsed = jsonParseWithCircular<typeof obj>(str);
    expect(parsed.a).to.equal(1);
    expect(parsed.self).to.equal(parsed);
  });

  it('should handle nested circular references', () => {
    const a: any = { name: 'a' };
    const b: any = { name: 'b', ref: a };
    a.ref = b;
    const str = jsonStringifyWithCircular(a);
    const parsed = jsonParseWithCircular<typeof a>(str);
    expect(parsed.name).to.equal('a');
    expect(parsed.ref.name).to.equal('b');
    expect(parsed.ref.ref).to.equal(parsed);
  });

  it('should handle arrays with circular references', () => {
    const arr: any[] = [1, 2];
    arr.push(arr);
    const str = jsonStringifyWithCircular(arr);
    const parsed = jsonParseWithCircular<typeof arr>(str);
    expect(parsed[0]).to.equal(1);
    expect(parsed[1]).to.equal(2);
    expect(parsed[2]).to.equal(parsed);
  });

  it('should handle objects with multiple references to the same object', () => {
    const shared = { value: 42 };
    const obj = { a: shared, b: shared };
    const str = jsonStringifyWithCircular(obj);
    const parsed = jsonParseWithCircular<typeof obj>(str);
    expect(parsed.a).to.equal(parsed.b);
    expect(parsed.a.value).to.equal(42);
  });

  // Helper class for circular reference test
  type SampleNodeType = {
    [key: string]: unknown;
    value: number;
    next?: SampleNodeType;
  };

  class SampleNode implements SampleNodeType {
    [key: string]: unknown;
    value: number;
    next?: SampleNodeType;
    constructor(value: number) {
      this.value = value;
    }
    // Utility to create a circular linked list of given length
    static createCircularList(length: number): SampleNodeType {
      const root = new SampleNode(0);
      let current: SampleNodeType = root;
      for (let i = 1; i <= length; i++) {
        current.next = new SampleNode(i);
        current = current.next;
        current.sample = {1: 0};
        (current.sample as Record<string, unknown>).next = current; // Create a circular reference
      }
      current.next = root;
      return root;
    }
  }

  it('should handle a thousand-level circular reference', () => {
    const root = SampleNode.createCircularList(1000);

    const str = jsonStringifyWithCircular(root);
    const parsed = jsonParseWithCircular<typeof root>(str);

    // Walk through the chain and check values and circularity
    let node = parsed;
    for (let i = 0; i <= 1000; i++) {
      expect(node.value).to.equal(i);
      node = node.next;
    }
    // After 1001 steps, we should be back at the root
    expect(node).to.equal(parsed);
  });
});
