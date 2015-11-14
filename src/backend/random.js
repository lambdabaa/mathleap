let random = require('lodash/number/random');
let range = require('lodash/utility/range');
let sample = require('lodash/collection/sample');
let times = require('lodash/utility/times');

let composites = [
  -4, -6, -8, -9,
  -10, -12, -14, -15, -16, -18,
  -20, -21, -22, -24, -25, -26, -27, -28,
  -30, -32, -33, -34, -35, -36, -38, -39,
  4, 6, 8, 9,
  10, 12, 14, 15, 16, 18,
  20, 21, 22, 24, 25, 26, 27, 28,
  30, 32, 33, 34, 35, 36, 38, 39
];

let chrs = [
  'a', 'b', 'c',
  'g', 'h', 'j',
  'k', 'm', 'n', 'p',
  'q', 'r', 's', 't', 'u',
  'v', 'w', 'x', 'y', 'z'
];

exports.integerList = function integerList(len) {
  return randomList(exports.integer.bind(null, -25, 25), len);
};

exports.compositeList = function compositeList(len) {
  return randomList(exports.composite, len);
};

exports.integer = function integer(low = -25, high = 25, exclude = {}) {
  return uniqueRandom(random.bind(null, low, high), exclude);
};

exports.composite = function composite(exclude = {}) {
  return uniqueRandom(() => sample(composites), exclude);
};

/**
 * TODO: There are better ways to do this...
 */
exports.factor = function factor(value) {
  let positives = range(2, Math.floor(Math.sqrt(Math.abs(value))) + 1);
  let negatives = positives.map(positive => -positive);
  let candidates = positives.concat(negatives).filter(candidate => {
    return value % candidate === 0 || value % candidate === -0;
  });

  return sample(candidates);
};

exports.letter = sample.bind(null, chrs);

/**
 * @param {Function} next generates next random.
 * @param {number} len how many random numbers to generate.
 */
function randomList(next, len) {
  let uniq = {};
  times(len, () => uniq[next(uniq)] = true);
  return Object.keys(uniq).map(key => parseInt(key, 10));
}

/**
 * @param {Function} next generates next random.
 * @param {Object} exclude keys to skip if they show up.
 */
function uniqueRandom(next, exclude) {
  let result;
  do {
    result = next();
  } while (!result || result in exclude);

  return result;
}
