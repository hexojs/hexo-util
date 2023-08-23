'use strict';

import { describe } from 'mocha';

// to run single test
// npm run test-single -- "Cache - Typescript"

describe('Cache - Typescript', async () => {
  await import('./cache-number.spec');
  await import('./cache-object.spec');
});
