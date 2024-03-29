import chai from 'chai';
import Pattern from '../lib/pattern';
chai.should();

describe('Pattern', () => {
  it('String - posts/:id', () => {
    const pattern = new Pattern('posts/:id');
    const result = pattern.match('/posts/89');

    result.should.eql({
      0: 'posts/89',
      1: '89',
      id: '89'
    });
  });

  it('String - posts/*path', () => {
    const pattern = new Pattern('posts/*path');
    const result = pattern.match('posts/2013/hello-world');

    result.should.eql({
      0: 'posts/2013/hello-world',
      1: '2013/hello-world',
      path: '2013/hello-world'
    });
  });

  it('String - posts/:id?', () => {
    const pattern = new Pattern('posts/:id?');

    pattern.match('posts/').should.eql({
      0: 'posts/',
      1: undefined,
      id: undefined
    });

    pattern.match('posts/89').should.eql({
      0: 'posts/89',
      1: '89',
      id: '89'
    });
  });

  it('RegExp', () => {
    const pattern = new Pattern(/ab?cd/);

    pattern.match('abcd').should.be.ok;
    pattern.match('acd').should.be.ok;
  });

  it('Function', () => {
    const pattern = new Pattern(str => {
      str.should.eql('foo');
      return {};
    });

    pattern.match('foo').should.eql({});
  });

  it('Pattern', () => {
    const pattern = new Pattern('posts/:id');
    new Pattern(pattern).should.eql(pattern);
  });

  it('rule is required', () => {
    (() => {
      // @ts-ignore
      // eslint-disable-next-line no-new
      new Pattern();
    }).should.throw('rule must be a function, a string or a regular expression.');
  });

  it('test function', () => {
    const pattern = new Pattern('posts/:id');

    pattern.test('/posts/89').should.eql(true);
    pattern.test('/post/89').should.eql(false);
  });

});
