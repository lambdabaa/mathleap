let assert = require('chai').assert;
let parse = require('../../src/backend/parse');
let stringify = require('../../src/backend/stringify');

suite('backend/math', () => {
  [
    '1 + 1',
    '2 * x',
    'y = 2 * (x + 1)',
    'x - (y + (2 - x)) = 0',
    '(3 * y) / (x / 2) = 0'
  ].forEach(testCase => {
    test(testCase, () => assert.equal(stringify(parse(testCase)), testCase));
  });
});
