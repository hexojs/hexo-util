'use strict';

require('chai').should();

const { delay } = require('bluebird');

// Worker Thread is available since Node.js 10.5.0
// eslint-disable-next-line node/no-unsupported-features/node-builtins
const { Worker } = require('worker_threads');
const { dirname, join } = require('path');

const { length: cpusLength } = require('os').cpus();

describe('WorkerPool', () => {
  const WorkerPool = require('../lib/workerpool');
  const workerPath = join(dirname(__dirname), 'scripts/dummy_worker.js');
  const pool = new WorkerPool(workerPath);
  const pool2 = new WorkerPool(workerPath, 3);
  const pool3 = new WorkerPool(workerPath, 2);

  it('init', () => {
    pool.workerPath.should.eql(workerPath);
    pool.numberOfThreads.should.eql(cpusLength);
    Object.keys(pool._workersById).length.should.eql(cpusLength);
    Object.keys(pool._activeWorkersById).length.should.eql(cpusLength);

    for (const i in pool._workersById) {
      pool._workersById[i].should.be.instanceof(Worker);
    }

    for (const i in pool._activeWorkersById) {
      pool._activeWorkersById[i].should.be.false;
    }
  });

  it('init - numberOfThreads', () => {
    pool2.numberOfThreads.should.eql(3);
    Object.keys(pool2._workersById).length.should.eql(3);
    Object.keys(pool2._activeWorkersById).length.should.eql(3);
  });

  it('init - numberOfThreads < 1', () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const pool = new WorkerPool(workerPath, 0);
    } catch (e) {
      e.message.should.eql('Number of threads should be greater or equal than 1!');
    }
  });

  it('run() - this should show "(500ms)" =>', async () => {
    const result = await pool.run({ data: 500 });
    result.should.eql('Worker is Cool!');
  });

  it('run() - push jobs to queue', async () => {
    for (let i = 0; i < 10; i++) {
      pool3.run({ data: 1000 });
    }

    pool3.getInactiveWorkerId().should.eql(-1);
    pool3._queue.length.should.eql(8);

    await delay(1000);

    pool3._queue.length.should.lessThan(8);
  });

  it('run() - error handling', () => {
    const pool = new WorkerPool(workerPath, 1);

    pool.run({ error: true }).catch(e => {
      e.message.should.eql('There goes an Error!');
    });
  });

  it('destroy()', () => {
    pool.destroy();
  });

  it('destroy() - force terminate workers', () => {
    pool2.run({ data: 1500 });
    pool2.destroy(true);
  });

  it('destroy() - terminate a running worker', () => {
    pool3.run({ data: 1500 });

    try {
      pool3.destroy();
    } catch (e) {
      e.message.should.eql('The worker 0 is still runing!');
      pool3.destroy(true);
    }
  });
});
