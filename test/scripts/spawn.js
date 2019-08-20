'use strict';

const should = require('chai').should();
const pathFn = require('path');
const fs = require('fs');
const rewire = require('rewire');

const isWindows = process.platform === 'win32';
const catCommand = isWindows ? 'type' : 'cat';

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

  it('default', () => spawn(catCommand, [fixturePath]).then(content => {
    content.should.eql(fixture);
  }));

  it('command is required', () => {
    spawn.should.throw('command is required!');
  });

  it('error', () => spawn(catCommand, ['nothing']).then(() => should.fail(`expected spawn(${catCommand}, ['nothing']) to throw an error`), err => {
    if (isWindows) {
      err.message.trim().should.eql('spawn type ENOENT');
      err.code.should.eql('ENOENT');
    } else {
      err.message.trim().should.eql('cat: nothing: No such file or directory');
      err.code.should.eql(1);
    }
  }));

  it('verbose - stdout', () => {
    const spawn = rewire('../../lib/spawn');
    const stdoutCache = new CacheStream();
    const stderrCache = new CacheStream();
    const content = 'something';

    spawn.__set__('process', Object.assign({}, process, {
      stdout: stdoutCache,
      stderr: stderrCache
    }));

    return spawn('echo', [content], {
      verbose: true
    }).then(() => {
      const result = stdoutCache.getCache().toString('utf8').trim();
      if (isWindows) {
        result.should.match(new RegExp(`^(["']?)${content}\\1$`));
      } else {
        result.should.eql(content);
      }
    });
  });

  it('verbose - stderr', () => {
    const spawn = rewire('../../lib/spawn');
    const stdoutCache = new CacheStream();
    const stderrCache = new CacheStream();

    spawn.__set__('process', Object.assign({}, process, {
      stdout: stdoutCache,
      stderr: stderrCache,
      removeListener: () => {},
      on: () => {}
    }));

    return spawn(catCommand, ['nothing'], {
      verbose: true
    }).then(() => should.fail(`expected spawn(${catCommand}, ['nothing'], {verbose: true}) to throw an error`), () => {
      const stderrResult = stderrCache.getCache();
      if (isWindows) {
        // utf8 support in windows shell (cmd.exe) is difficult.
        Buffer.byteLength(stderrResult, 'hex').should.least(1);
      } else {
        stderrResult.toString('utf8').trim().should.eql('cat: nothing: No such file or directory');
      }
    });
  });

  it('custom encoding', () => spawn(catCommand, [fixturePath], {encoding: 'hex'}).then(content => {
    content.should.eql(Buffer.from(fixture).toString('hex'));
  }));

  it('encoding = null', () => spawn(catCommand, [fixturePath], {encoding: null}).then(content => {
    content.should.eql(Buffer.from(fixture));
  }));

  it('stdio = inherit', () => spawn('echo', ['something'], {
    stdio: 'inherit'
  }));
});
