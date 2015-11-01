let array = require('../../src/backend/array');

suite('array', () => {
  test('#partition', () => {
    array.partition(
      [3, 2, 5, 1, -2, 0, 6],
      element => element > 2
    )
    .should
    .deep
    .equal([
      [3, 5, 6],
      [2, 1, -2, 0]
    ]);
  });

  test('#replaceIndex', () => {
    array.replaceIndex(
      [3, 2, 5, 1, -2, 0, 6],
      2,
      [3, 1, 4]
    )
    .should
    .deep
    .equal([3, 2, 3, 1, 4, 1, -2, 0, 6]);
  });
});
