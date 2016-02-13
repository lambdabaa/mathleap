let assert = require('chai').assert;
let parse = require('../../../client/backend/parse');
let stringify = require('../../../client/backend/stringify');

suite('backend/math', () => {
  [
    '1 + 1',
    '2 * x',
    'y = 2 * (x + 1)',
    'x - (y + (2 - x)) = 0',
    '(3 * y) / (x / 2) = 0',
    '3 * |x + 2|',
    '3 * |x - |y - 2 * x||'
  ].forEach(testCase => {
    test(testCase, () => assert.equal(stringify(parse(testCase)), testCase));
  });

  [
    ['|-2|', '|-1 * 2|'],
    ['3x ^ 2', '3 * x ^ 2'],
    ['|7*-2|-5*|5-7|', '|7 * -1 * 2| - 5 * |5 - 7|']
  ].forEach(testCase => {
    test(testCase[0], () => assert.equal(stringify(parse(testCase[0])), testCase[1]));
  });
});
