var should = require('chai').should();

describe('format', function(){
  var format = require('../lib/format');

  it('stripHTML()', function(){
    format.stripHTML('Strip <i>these</i> tags!').should.eql('Strip these tags!');

    format.stripHTML('<b>Bold</b> no more!  <a href="more.html">See more here</a>...')
      .should.eql('Bold no more!  See more here...');

    format.stripHTML('<div id="top-bar">Welcome to my website!</div>')
      .should.eql('Welcome to my website!');
  });

  it('trim()', function(){
    format.trim('   foo bar baz    ').should.eql('foo bar baz');
    format.trim('   foo bar baz').should.eql('foo bar baz');
    format.trim('foo bar baz    ').should.eql('foo bar baz');
    format.trim('foo bar baz').should.eql('foo bar baz');
  });

  it('wordWrap()', function(){
    format.wordWrap('Once upon a time').should.eql('Once upon a time');

    format.wordWrap('Once upon a time, in a kingdom called Far Far Away, a king fell ill, and finding a successor to the throne turned out to be more trouble than anyone could have imagined...')
      .should.eql('Once upon a time, in a kingdom called Far Far Away, a king fell ill, and finding\na successor to the throne turned out to be more trouble than anyone could have\nimagined...')

    format.wordWrap('Once upon a time', {width: 8}).should.eql('Once\nupon a\ntime');

    format.wordWrap('Once upon a time', {width: 1}).should.eql('Once\nupon\na\ntime');
  });

  it('truncate()', function(){
    format.truncate('Once upon a time in a world far far away')
      .should.eql('Once upon a time in a world...');

    format.truncate('Once upon a time in a world far far away', {length: 17})
      .should.eql('Once upon a ti...');

    format.truncate('Once upon a time in a world far far away', {length: 17, separator: ' '})
      .should.eql('Once upon a...');

    format.truncate('And they found that many people were sleeping better.', {length: 25, omission: '... (continued)'})
      .should.eql('And they f... (continued)');
  });
});