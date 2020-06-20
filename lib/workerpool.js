'use strict';

// Worker Thread is available since Node.js 10.5.0
// eslint-disable-next-line node/no-unsupported-features/node-builtins
const { Worker } = require('worker_threads');
const Promise = require('bluebird');
const { length: cpusLength } = require('os').cpus();

class WorkerPool {

  /**
   * @param {string} workerPath The path of the worker file
   * @param {number} numberOfThreads
   */
  constructor(workerPath, numberOfThreads = cpusLength) {
    if (numberOfThreads < 1) {
      throw new Error('Number of threads should be greater or equal than 1!');
    }

    this.workerPath = workerPath;
    this.numberOfThreads = numberOfThreads;

    this._queue = []; // Queue Item, the queue of the task.
    this._workersById = {}; // { [key: number]: Worker }
    this._activeWorkersById = {}; // { [key: number]: boolean }

    for (let i = 0; i < this.numberOfThreads; i++) {
      const worker = new Worker(workerPath);

      this._workersById[i] = worker;
      this._activeWorkersById[i] = false;
    }
  }

  /**
   * @description Get one inactive worker
   * @returns {number} The id of the inactive workers
   */
  getInactiveWorkerId() {
    for (let i = 0; i < this.numberOfThreads; i++) {
      if (!this._activeWorkersById[i]) {
        return i;
      }
    }

    return -1;
  }

  /**
   * @description Call worker
   * @param {number} workerId The is of the worker that will be used
   * @param {object} task The task object
   */
  runWorker(workerId, task) {
    const worker = this._workersById[workerId];

    /**
     * @description Remove the listener of the worker, inactive the worker, and run next task from queue.
     */
    const doAfterTaskIsFinished = () => {
      // Clean up worker listeners, to avoid OOM caused by unreleased listeners.
      worker.removeAllListeners('message');
      worker.removeAllListeners('error');

      this._activeWorkersById[workerId] = false;

      if (this._queue.length) {
        // Queue is not empty, run the first task from it
        this.runWorker(workerId, this._queue.shift());
      }
    };

    // Set this worker to active
    this._activeWorkersById[workerId] = true;

    // Receive result through worker, resolve the Promise of the task
    const messageCallback = result => {
      task.cb(null, result);
      doAfterTaskIsFinished();
    };
    // Receive an error, reject the Promise of the task
    const errorCallback = error => {
      task.cb(error);
      doAfterTaskIsFinished();
    };

    // Add listener for worker
    worker.once('message', messageCallback);
    worker.once('error', errorCallback);
    // Pass data as message
    worker.postMessage(task.data);
  }

  /**
   * @description Setup a task using the data
   * @param {*} data
   */
  run(data) {
    return new Promise((resolve, reject) => {
      const availableWorkerId = this.getInactiveWorkerId();

      const task = {
        data,
        cb: (error, result) => {
          if (error) {
            reject(error);
          }

          return resolve(result);
        }
      };

      if (availableWorkerId === -1) {
        // No inactive worker, add the task to the queue.
        this._queue.push(task);
        return null;
      }

      // There is an inactive worker, run the task in that worker.
      this.runWorker(availableWorkerId, task);
    });
  }

  destroy(force = false) {
    for (let i = 0; i < this.numberOfThreads; i++) {
      if (this._activeWorkersById[i] && !force) {
        throw new Error(`The worker ${i} is still runing!`);
      }

      // Terminate the worker
      this._workersById[i].terminate();
    }
  }
}

module.exports = WorkerPool;
