let gradient = require('../../../client/frontend/gradient');

test('gradient', () => {
  gradient(
    {r: 5, g: 10, b: 15},
    {r: 15, g: 10, b: 5},
    0.5
  )
  .should
  .deep
  .equal({r: 10, g: 10, b: 10});
});
