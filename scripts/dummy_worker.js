'use strict';

// eslint-disable-next-line node/no-unsupported-features/node-builtins
const { isMainThread, parentPort } = require('worker_threads');

if (isMainThread) throw new Error('It is not a worker, it is now at Main Thread.');

const job = ({ data = 10, error = false }) => {
  if (error) {
    throw new Error('There goes an Error!');
  }

  const start = new Date();
  while (new Date() - start < data) { /* */ }

  return 'Worker is Cool!';
};

parentPort.on('message', data => {
  const result = job(data);

  parentPort.postMessage(result);
});
