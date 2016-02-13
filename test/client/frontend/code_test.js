let {create, decode, encode} = require('../../../client/frontend/code');

// TODO: Should use sinon timers thing to mock.
suite('code', () => {
  test('#create', () => {
    create().should.match(/^[0-9A-Z-a-z!%\+\-=_~]{8}$/);
  });

  test('#encode, #decode', () => {
    let code = 19989696724224;
    decode(encode(code)).should.equal(code);
  });
});
