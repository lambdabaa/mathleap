let drainIterator = require('../../gen/drainIterator');
let listProblems = require('../../gen/listProblems');

test('listProblems Ax=B', () => {
  let it = listProblems({
    format: 'Ax=B',
    constraints: [
      'A * x === B',
      'B % A === 0',
      'Math.abs(A) > 1',
      'Math.abs(x) > 1'
    ]
  });

  drainIterator(it).length.should.equal(152);
});

test.skip('listProblems Ax^2+Bx+C=0', () => {
  let it = listProblems({
    format: 'Ax^2+Bx+C=0',
    constraints: [
      'A * Math.pow(x, 2) + B * x + C === 0',
      'A !== 0',
      'Math.abs(B) > 1',
      'C !== 0',
      'Math.abs(x) > 1'
    ]
  });
});
