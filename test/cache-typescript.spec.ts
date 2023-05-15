'use strict';

import { describe } from 'mocha';

// to run single test (using yarn dlx https://yarnpkg.com/cli/dlx#examples)
// yarn dlx -p typescript -p ts-node -p chai -p mocha mocha --require ts-node/register --exit --grep "Cache - Typescript"

describe('Cache - Typescript', async () => {
  await import('./cache-number.test');
});
