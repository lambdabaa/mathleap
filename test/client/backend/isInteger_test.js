let isInteger = require('../../../client/backend/isInteger');

suite('#isInteger', () => {
  test('true', () => {
    isInteger(5).should.equal(true);
  });

  test('.0', () => {
    isInteger(-5.00).should.equal(true);
  });

  test('false', () => {
    isInteger(3.99).should.equal(false);
  });
});
