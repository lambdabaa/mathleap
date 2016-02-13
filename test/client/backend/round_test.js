let round = require('../../../client/backend/round');

suite('round', () => {
  test('below', () => {
    round(4.999999999999999).should.equal(5);
  });

  test('above', () => {
    round(5.000000000000001).should.equal(5);
  });

  test('equal', () => {
    round(3.33).should.equal(3.33);
  });
});
