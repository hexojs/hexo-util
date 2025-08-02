import { expect } from 'chai';
import * as crossDirname from '../lib/cross_dirname.js';

describe('cross_dirname', () => {
  describe('getDirname', () => {
    it('should return a string', () => {
      const dirname = crossDirname.getDirname();
      expect(dirname).to.be.a('string');
    });
    it('should not be empty', () => {
      const dirname = crossDirname.getDirname();
      expect(dirname).to.not.equal('');
    });
  });

  describe('getFilename', () => {
    it('should return a string', () => {
      const filename = crossDirname.getFilename();
      expect(filename).to.be.a('string');
    });
    it('should not be empty', () => {
      const filename = crossDirname.getFilename();
      expect(filename).to.not.equal('');
    });
    it('should end with .ts or .js', () => {
      const filename = crossDirname.getFilename();
      expect(filename.endsWith('.ts') || filename.endsWith('.js')).to.be.true;
    });
  });
});
