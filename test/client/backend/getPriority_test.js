let getPriority = require('../../../client/backend/getPriority');

suite('getPriority', () => {
  test('add', () => {
    getPriority('(2*3)+(3^4)').should.equal(0);
  });

  test('subtract', () => {
    getPriority('p-5').should.equal(0);
  });

  test('multiply', () => {
    getPriority('2*(3+4)').should.equal(1);
  });

  test('divide', () => {
    getPriority('2*3/4').should.equal(2);
  });

  test('power', () => {
    getPriority('(2/4)^3').should.equal(3);
  });

  test('negate', () => {
    getPriority('-5').should.equal(1);
  });

  test('atom', () => {
    getPriority('5').should.equal(4);
  });
});
