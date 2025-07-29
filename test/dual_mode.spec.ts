import { expect } from 'chai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Test import module in dual environment', function () {
  this.timeout(30000); // Increase Mocha timeout to allow for module loading

  it('imports ESM modules and exposes url_for()', async function () {
    const { importModules } = await import('./utils.cjs');
    const { lib, mode } = await importModules('esm');
    expect(lib).to.have.property('url_for').that.is.a('function');
    expect(mode).to.equal('esm');
    expect(lib.url_for).to.be.a('function');
    const result = lib.url_for('test/test-import.mjs');
    expect(result).to.be.a('string');
  });

  it('imports CJS modules and exposes url_for()', async function () {
    const { importModules } = await import('./utils.cjs');
    const { lib, mode } = await importModules('cjs');
    expect(lib).to.have.property('url_for').that.is.a('function');
    expect(mode).to.equal('cjs');
    expect(lib.url_for).to.be.a('function');
    const result = lib.url_for('test/test-import.mjs');
    expect(result).to.be.a('string');
  });
});
