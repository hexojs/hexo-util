'use strict';

require('chai').should();
const { sep } = require('path');
const join = require('../lib/join_path');

describe('joinPath', () => {
  it('one path', () => {
    const content = 'foo/bar';
    join(content).should.eql('foo' + sep + 'bar');
  });

  it('no argument', () => {
    join().should.eql('.');
  });

  it('zero-length string', () => {
    join('').should.eql('.');
  });

  it('two paths', () => {
    join('foo', 'bar').should.eql('foo' + sep + 'bar');
  });

  it('one path - custom separator', () => {
    const custom = '\\';
    join('foo/bar', { sep: custom }).should.eql('foo' + custom + 'bar');
  });

  it('two paths - custom separator', () => {
    const custom = '\\';
    join('foo', 'bar', { sep: custom }).should.eql('foo' + custom + 'bar');
  });

  it('deduplicate separators', () => {
    join('foo/', '/bar').should.eql('foo' + sep + 'bar');
  });

  it('starting and ending slashes', () => {
    join('/foo/', '/bar/').should.eql(sep + 'foo' + sep + 'bar' + sep);
  });

  it('mixed slashes', () => {
    join('foo/', '\\bar').should.eql('foo' + sep + 'bar');
  });

  it('mixed and >2 slashes', () => {
    join('foo////', '\\\\bar').should.eql('foo' + sep + 'bar');
  });

  it('mixed and >2 slashes - custom separator', () => {
    const custom = '\\';
    join('foo////', '\\\\bar', { sep: custom }).should.eql('foo' + custom + 'bar');
  });

  it('three paths', () => {
    join('foo', 'bar', 'baz').should.eql('foo' + sep + 'bar' + sep + 'baz');
  });

  it('three paths - custom separator', () => {
    const custom = '\\';
    join('foo', 'bar', 'baz', { sep: custom }).should.eql('foo' + custom + 'bar' + custom + 'baz');
  });
});
