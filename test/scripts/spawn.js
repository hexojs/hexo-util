'use strict';

const should = require('chai').should(); // eslint-disable-line
const pathFn = require('path');
const fs = require('fs');
const rewire = require('rewire');

describe('spawn', () => {
  const spawn = require('../../lib/spawn');
  const CacheStream = require('../../lib/cache_stream');
  const fixturePath = pathFn.join(__dirname, 'spawn_test.txt');
  const fixture = 'test content';

  before(done => {
    fs.writeFile(fixturePath, fixture, done);
  });

  after(done => {
    fs.unlink(fixturePath, done);
  });

  it('default', () => spawn('cat', [fixturePath]).then(content => {
    content.should.eql(fixture);
  }));

  it('command is required', () => {
    try {
      spawn();
    } catch (err) {
      err.should.have.property('message', 'command is required!');
    }
  });

  it('error', () => spawn('cat', ['nothing']).catch(err => {
    err.message.trim().should.eql('cat: nothing: No such file or directory');
    err.code.should.eql(1);
  }));

  it('verbose - stdout', () => {
    const spawn = rewire('../../lib/spawn');
    const stdoutCache = new CacheStream();
    const stderrCache = new CacheStream();
    const content = 'something';

    spawn.__set__('process', {
      stdout: stdoutCache,
      stderr: stderrCache,
      removeListener: () => {},
      on: () => {}
    });

    return spawn('echo', [content], {
      verbose: true
    }).then(() => {
      stdoutCache.getCache().toString('utf8').trim().should.eql(content);
    });
  });

  it('verbose - stderr', () => {
    const spawn = rewire('../../lib/spawn');
    const stdoutCache = new CacheStream();
    const stderrCache = new CacheStream();

    spawn.__set__('process', {
      stdout: stdoutCache,
      stderr: stderrCache,
      removeListener: () => {},
      on: () => {}
    });

    return spawn('cat', ['nothing'], {
      verbose: true
    }).catch(() => {
      stderrCache.getCache().toString('utf8').trim().should
        .eql('cat: nothing: No such file or directory');
    });
  });

  it('custom encoding', () => spawn('cat', [fixturePath], {encoding: 'hex'}).then(content => {
    content.should.eql(Buffer.from(fixture).toString('hex'));
  }));

  it('encoding = null', () => spawn('cat', [fixturePath], {encoding: null}).then(content => {
    content.should.eql(Buffer.from(fixture));
  }));

  it('stdio = inherit', () => spawn('echo', ['something'], {
    stdio: 'inherit'
  }));
});
