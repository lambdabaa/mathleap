let code = require('../../src/frontend/code');

// TODO: Should use sinon timers thing to mock.
suite('code', () => {
  test('create', () => {
    code.create().should.match(/^[0-9A-Z-a-z!%\+\-=_~]{8}$/);
  });
});
