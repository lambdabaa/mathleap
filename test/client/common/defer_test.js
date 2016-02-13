let assert = require('assert');
let defer = require('../../../client/common/defer');

suite('defer', () => {
  test('resolve', async function() {
    let {promise, resolve} = defer();
    setTimeout(resolve, 25);
    await promise;
  });

  test('reject', async function() {
    let {promise, reject} = defer();
    try {
      setTimeout(() => reject(new Error('ouch')), 25);
      await promise;
    } catch (error) {
      error.message.should.equal('ouch');
      return;
    }

    assert.fail('promise.reject should have thrown error');
  });
});
