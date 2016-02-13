/* @flow */
/**
 * @fileoverview Promise.defer()
 */

type Deferred = {
  promise: Promise;
  resolve: (x: any) => void;
  reject: (x: Error) => void;
};

module.exports = function(): Deferred {
  let resolve = fail;
  let reject = fail;
  let promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return {promise, resolve, reject};
};

function fail() {
  throw new Error('deferred called synchronously!');
}
