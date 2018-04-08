'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('fs');
var rewire = require('rewire');

describe('spawn', function() {
  var spawn = require('../../lib/spawn');
  var CacheStream = require('../../lib/cache_stream');
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

  it('verbose - stdout', function() {
    var spawn = rewire('../../lib/spawn');
    var stdoutCache = new CacheStream();
    var stderrCache = new CacheStream();
    var content = 'something';

    spawn.__set__('process', {
      stdout: stdoutCache,
      stderr: stderrCache
    });

    return spawn('echo', [content], {
      verbose: true
    }).then(function() {
      stdoutCache.getCache().toString('utf8').trim().should.eql(content);
    });
  });

  it('verbose - stderr', function() {
    var spawn = rewire('../../lib/spawn');
    var stdoutCache = new CacheStream();
    var stderrCache = new CacheStream();

    spawn.__set__('process', {
      stdout: stdoutCache,
      stderr: stderrCache
    });

    return spawn('cat', ['nothing'], {
      verbose: true
    }).catch(function() {
      stderrCache.getCache().toString('utf8').trim().should
        .eql('cat: nothing: No such file or directory');
    });
  });

  it('custom encoding', function() {
    return spawn('cat', [fixturePath], {encoding: 'hex'}).then(function(content) {
      content.should.eql(Buffer.from(fixture).toString('hex'));
    });
  });

  it('encoding = null', function() {
    return spawn('cat', [fixturePath], {encoding: null}).then(function(content) {
      content.should.eql(Buffer.from(fixture));
    });
  });

  it('stdio = inherit', function() {
    return spawn('echo', ['something'], {
      stdio: 'inherit'
    });
  });
});
