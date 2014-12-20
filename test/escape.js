var should = require('chai').should();

describe('escape', function(){
  var escape = require('../lib/escape');

  it('path()', function(){
    // spaces
    escape.filename('Hello World').should.eql('Hello-World');

    // transform
    escape.filename('Hello World', 1).should.eql('hello-world');
    escape.filename('Hello World', 2).should.eql('HELLO-WORLD');

    // diacritic
    escape.filename('Hell\u00F2 w\u00F2rld').should.eql('Hello-world');
  });

  it('path()', function(){
    // spaces
    escape.path('Hello World').should.eql('Hello-World');

    // transform
    escape.path('Hello World', 1).should.eql('hello-world');
    escape.path('Hello World', 2).should.eql('HELLO-WORLD');

    // continous dashes
    escape.path('Hello  World').should.eql('Hello-World');

    // trailing dash
    escape.path('Hello World~').should.eql('Hello-World');

    // other special characters
    escape.path('Hello ~`!@#$%^&*()-_+=[]{}|\\;:"\'<>,.?/World').should.eql('Hello-World');
  });

  it('regex()', function(){
    escape.regex('hello*world').should.eql('hello\\*world');
  });

  it('diacritic()', function(){
    escape.diacritic('Hell\u00F2 w\u00F2rld').should.eql('Hello world');
  });

  it('html()', function(){
    escape.html('<p>Hello "world".</p>').should.eql('&lt;p&gt;Hello &quot;world&quot;.&lt;&#x2F;p&gt;');
  });
});