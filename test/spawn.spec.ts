import chai from 'chai';
import { join } from 'path';
import { writeFile, unlink } from 'fs';
import rewire from 'rewire';
import spawn from '../lib/spawn';
import CacheStream from '../lib/cache_stream';

chai.should();

const isWindows = process.platform === 'win32';
const catCommand = isWindows ? 'type' : 'cat';

describe('spawn', () => {
  const fixturePath = join(__dirname, 'spawn_test.txt');
  const fixture = 'test content';

  before(done => {
    writeFile(fixturePath, fixture, done);
  });

  after(done => {
    unlink(fixturePath, done);
  });

  it('default', async () => {
    const out = await spawn(catCommand, [fixturePath]) as string;
    out.should.eql(fixture);
  });

  it('default - string', async () => {
    const out = await spawn(catCommand, fixturePath) as string;
    out.should.eql(fixture);
  });

  it('default - empty argument and options', async () => {
    if (isWindows) {
      const out = await spawn('ver') as string;
      out.trim().startsWith('Microsoft Windows').should.eql(true);
    } else {
      const out = await spawn('uname') as string;
      ['Linux', 'Darwin'].includes(out.trim()).should.eql(true);
    }
  });

  it('default - options and empty argument', async () => {
    if (isWindows) {
      const out = await spawn('chdir', { cwd: __dirname }) as string;
      out.trim().should.eql(__dirname);
    } else {
      const out = await spawn('pwd', { cwd: __dirname }) as string;
      out.trim().should.eql(__dirname);
    }
  });

  it('command is required', () => {
    spawn.should.throw('command is required!');
  });

  it('error', async () => {
    try {
      await spawn(catCommand, ['nothing']);
      // should not reach here
      true.should.eql(false);
    } catch (e) {
      if (isWindows) {
        e.message.should.eql('spawn type ENOENT');
        e.should.have.property('code', 'ENOENT');
      } else {
        e.message.should.with.match(/^cat: nothing: No such file or directory\n?$/);
        e.should.have.property('code', 1);
      }
    }
  });

  it('verbose - stdout', () => {
    const _spawn = rewire<typeof spawn>('../dist/spawn');
    const stdoutCache = new CacheStream();
    const stderrCache = new CacheStream();
    const content = 'something';

    _spawn.__set__('process', Object.assign({}, process, {
      stdout: stdoutCache,
      stderr: stderrCache
    }));

    return _spawn('echo', [content], {
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
    const _spawn = rewire<typeof spawn>('../dist/spawn');
    const stdoutCache = new CacheStream();
    const stderrCache = new CacheStream();

    _spawn.__set__('process', Object.assign({}, process, {
      stdout: stdoutCache,
      stderr: stderrCache,
      removeListener: () => {},
      on: () => {}
    }));

    return _spawn(catCommand, ['nothing'], {
      verbose: true
    }).then(() => {
      // should not reach here
      true.should.eql(false);
    }, e => {
      return e;
    }).then(() => {
      const stderrResult = stderrCache.getCache();
      if (isWindows) {
        // utf8 support in windows shell (cmd.exe) is difficult.
        Buffer.byteLength(stderrResult, 'hex').should.least(1);
      } else {
        stderrResult.toString('utf8').should.with.match(/^cat: nothing: No such file or directory\n?$/);
      }
    });
  });

  it('custom encoding', async () => {
    const out = await spawn(catCommand, [fixturePath], {encoding: 'hex'}) as Buffer;
    out.should.eql(Buffer.from(fixture).toString('hex'));
  });

  it('encoding = null', async () => {
    // @ts-ignore
    const out = await spawn(catCommand, [fixturePath], {encoding: null}) as Buffer;
    out.should.eql(Buffer.from(fixture));
  });

  it('stdio = inherit', () => spawn('echo', ['something'], { stdio: 'inherit' }));

  it('exit with code', async () => {
    try {
      if (isWindows) {
        await spawn('cmd.exe', ['/c', 'exit', '1'], { stdio: 'inherit' });
      } else {
        await spawn('sh', ['/c', 'exit', '1'], { stdio: 'inherit' });
      }
      // should not reach here
      true.should.eql(false);
    } catch (error) {
      error.message.should.equal('Spawn failed');
    }
  });
});
