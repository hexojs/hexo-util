import chai from 'chai';
import Permalink from '../lib/permalink';
chai.should();

describe('Permalink', () => {
  let permalink;

  it('constructor', () => {
    permalink = new Permalink(':year/:month/:day/:title');

    permalink.rule.should.eql(':year/:month/:day/:title');
    permalink.regex.should.eql(/^(.+?)\/(.+?)\/(.+?)\/(.+?)$/);
    permalink.params.should.eql(['year', 'month', 'day', 'title']);

    permalink = new Permalink(':year_:i_month_:i_day_:title');

    permalink.rule.should.eql(':year_:i_month_:i_day_:title');
    permalink.regex.should.eql(/^(.+?)_(.+?)_(.+?)_(.+?)$/);
    permalink.params.should.eql(['year', 'i_month', 'i_day', 'title']);

    permalink = new Permalink(':year/:month/:day/:title', {
      segments: {
        year: '(\\d{4})',
        month: '(\\d{2})',
        day: '(\\d{2})'
      }
    });

    permalink.rule.should.eql(':year/:month/:day/:title');
    permalink.regex.should.eql(/^(\d{4})\/(\d{2})\/(\d{2})\/(.+?)$/);
    permalink.params.should.eql(['year', 'month', 'day', 'title']);

    permalink = new Permalink(':year/:month/:day/:title', {
      segments: {
        year: /(\d{4})/,
        month: /(\d{2})/,
        day: /(\d{2})/
      }
    });

    permalink.rule.should.eql(':year/:month/:day/:title');
    permalink.regex.should.eql(/^(\d{4})\/(\d{2})\/(\d{2})\/(.+?)$/);
    permalink.params.should.eql(['year', 'month', 'day', 'title']);
  });

  it('rule is required', () => {
    try {
      // @ts-ignore
      // eslint-disable-next-line no-new
      new Permalink();
    } catch (err) {
      err.should.have.property('message', 'rule is required!');
    }
  });

  it('test()', () => {
    permalink.test('2014/01/31/test').should.be.true;
    permalink.test('foweirojwoier').should.be.false;
  });

  it('parse()', () => {
    permalink.parse('2014/01/31/test').should.eql({
      year: '2014',
      month: '01',
      day: '31',
      title: 'test'
    });
    (typeof permalink.parse('test')).should.eql('undefined');
  });

  it('stringify()', () => {
    permalink.stringify({
      year: '2014',
      month: '01',
      day: '31',
      title: 'test'
    }).should.eql('2014/01/31/test');
  });

  it('stringify() - avoid infinite loops', () => {
    const post = {
      get path() {
        return this.permalink;
      },

      get permalink() {
        const permalink = new Permalink('/:permalink');
        return permalink.stringify(post);
      }
    };

    (() => post.path).should.throw('Invalid permalink setting!');
    (() => post.permalink).should.throw('Invalid permalink setting!');
  });
});
