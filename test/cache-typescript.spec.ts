'use strict';

import { describe } from 'mocha';

// to run single test
// mocha --require ts-node/register --exit --grep "Cache - Typescript"

describe('Cache - Typescript', () => {
  import('./cache-number.test');
});
