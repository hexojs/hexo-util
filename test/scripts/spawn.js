'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('fs');

describe('spawn', function() {
  var spawn = require('../../lib/spawn');
  var fixturePath = pathFn.join(__dirname, 'spawn_test.txt');
  var fixture = 'test content';

  before(function(done) {
    fs.writeFile(fixturePath, fixture, done);
  });

  after(function(done) {
    fs.unlink(fixturePath, done);
  });

  it('default', function() {
    return spawn('cat', [fixturePath]).then(function(content) {
      content.should.eql(fixture);
    });
  });

  it('command is required', function() {
    try {
      spawn();
    } catch (err) {
      err.should.have.property('message', 'command is required!');
    }
  });

  it('error', function() {
    return spawn('cat', ['nothing']).catch(function(err) {
      err.message.trim().should.eql('cat: nothing: No such file or directory');
      err.code.should.eql(1);
    });
  });

  it('verbose');

  it('custom encoding', function() {
    return spawn('cat', [fixturePath], {encoding: 'hex'}).then(function(content) {
      content.should.eql(new Buffer(fixture).toString('hex'));
    });
  });

  it('encoding = null', function() {
    return spawn('cat', [fixturePath], {encoding: null}).then(function(content) {
      content.should.eql(new Buffer(fixture));
    });
  });
});
