'use strict';

require('chai').use(require('chai-as-promised')).should();
const { join } = require('path');
const { writeFile, unlink } = require('fs');
const rewire = require('rewire');

const isWindows = process.platform === 'win32';
const catCommand = isWindows ? 'type' : 'cat';

describe('spawn', () => {
  const spawn = require('../lib/spawn');
  const CacheStream = require('../lib/cache_stream');
  const fixturePath = join(__dirname, 'spawn_test.txt');
  const fixture = 'test content';

  before(done => {
    writeFile(fixturePath, fixture, done);
  });

  after(done => {
    unlink(fixturePath, done);
  });

  it('default', () => spawn(catCommand, [fixturePath]).should.become(fixture));

  it('default - string', () => spawn(catCommand, fixturePath).should.become(fixture));

  it('default - empty argument and options', async () => {
    if (isWindows) {
      const out = await spawn('ver');
      out.trim().startsWith('Microsoft Windows').should.eql(true);
    } else {
      const out = await spawn('uname');
      ['Linux', 'Darwin'].includes(out.trim()).should.eql(true);
    }
  });

  it('default - options and empty argument', async () => {
    if (isWindows) {
      const out = await spawn('chdir', { cwd: __dirname });
      out.trim().should.eql(__dirname);
    } else {
      const out = await spawn('pwd', { cwd: __dirname });
      out.trim().should.eql(__dirname);
    }
  });

  it('command is required', () => {
    spawn.should.throw('command is required!');
  });

  it('error', () => {
    const promise = spawn(catCommand, ['nothing']);
    if (isWindows) {
      return promise.should.rejectedWith('spawn type ENOENT').and.eventually.have.property('code', 'ENOENT');
    }
    return promise.should.rejectedWith('cat: nothing: No such file or directory').and.eventually.have.property('code', 1);
  });

  it('verbose - stdout', () => {
    const spawn = rewire('../lib/spawn');
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
    const spawn = rewire('../lib/spawn');
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
    }).should.rejected.then(() => {
      const stderrResult = stderrCache.getCache();
      if (isWindows) {
        // utf8 support in windows shell (cmd.exe) is difficult.
        Buffer.byteLength(stderrResult, 'hex').should.least(1);
      } else {
        stderrResult.toString('utf8').should.with.match(/^cat: nothing: No such file or directory\n?$/);
      }
    });
  });

  it('custom encoding', () => {
    return spawn(catCommand, [fixturePath], {encoding: 'hex'}).should.become(Buffer.from(fixture).toString('hex'));
  });

  it('encoding = null', () => {
    return spawn(catCommand, [fixturePath], {encoding: null}).should.become(Buffer.from(fixture));
  });

  it('stdio = inherit', () => spawn('echo', ['something'], { stdio: 'inherit' }));
});
