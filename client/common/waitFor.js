/* @flow */

let sleep = require('./sleep');

async function waitFor(test: Function): Promise<void> {
  let result = test();
  if (result) {
    return result;
  }

  await sleep(100);
  return waitFor(test);
}

module.exports = waitFor;
