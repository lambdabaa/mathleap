/**
 * @fileoverview Utility methods to generate random data.
 */

let isInteger = require('./isInteger');
let random = require('lodash/number/random');
let range = require('lodash/utility/range');
let sample = require('lodash/collection/sample');
let times = require('lodash/utility/times');

let composites = exports.composites = [
  -4, -6, -8, -9,
  -10, -12, -14, -15, -16, -18,
  -20, -21, -22, -24, -25, -26, -27, -28,
  -30, -32, -33, -34, -35, -36, -38, -39,
  4, 6, 8, 9,
  10, 12, 14, 15, 16, 18,
  20, 21, 22, 24, 25, 26, 27, 28,
  30, 32, 33, 34, 35, 36, 38, 39
];

let superComposites = exports.superComposites = [
  -12, -16, -18, -20, -24, -28,
  -30, -32, -36,
  12, 16, 18, 20, 24, 28,
  30, 32, 36
];

let chrs = exports.chrs = [
  'a', 'b', 'c',
  'g', 'h', 'j',
  'k', 'm', 'n', 'p',
  'q', 'r', 's', 't', 'u',
  'v', 'w', 'x', 'y', 'z'
];

let randomInteger = random.bind(null, -25, 25);
let randomComposite = sample.bind(null, composites);
let randomSuperComposite = sample.bind(null, superComposites);
exports.integer = uniqueRandom.bind(exports, randomInteger);
exports.composite = uniqueRandom.bind(exports, randomComposite);
exports.superComposite = uniqueRandom.bind(exports, randomSuperComposite);
exports.power = uniqueRandom.bind(exports, randomPower);
exports.integerList = randomList.bind(exports, exports.integer);
exports.compositeList = randomList.bind(exports, exports.composite);
exports.superCompositeList = randomList.bind(exports, exports.superComposite);
exports.powerList = randomList.bind(exports, exports.power);
exports.factorList = randomList.bind(exports, exports.factor);
exports.fraction = uniqueRandom.bind(exports, randomFraction);
exports.fractionList = randomList.bind(exports, exports.fraction);
exports.boolean = sample.bind(null, [true, false]);
exports.letter = sample.bind(null, chrs);

function randomFraction() {
  let a = exports.integer();
  let b = exports.integer([0] /* can't divide by 0 */);
  let numerator, denominator;
  if (a > b) {
    denominator = a;
    numerator = b;
  } else {
    denominator = b;
    numerator = a;
  }

  return `${numerator}/${denominator}`;
}

exports.nonZero = function() {
  let magnitude = random(1, 25);
  let negative = exports.boolean();
  return negative ? -magnitude : magnitude;
};

/**
 * TODO: There are better ways to do this...
 */
exports.factor = function(value) {
  let positives = range(2, Math.floor(Math.sqrt(Math.abs(value))) + 1);
  let negatives = positives.map(positive => -positive);
  return sample(
    positives
      .concat(negatives)
      .filter(candidate => {
        return value % candidate === 0 || value % candidate === -0;
      })
  );
};

exports.compositeFactor = function(value) {
  return sample(composites.filter(candidate => {
    return value % candidate === 0 || value % candidate === -0;
  }));
};

function randomPower() {
  let small = range(-10, 10);
  let tiny = range(0, 3);
  let base = sample(small);
  let exp = sample(tiny);
  return Math.pow(base, exp);
}

/**
 * @param {Function} next generates next random.
 * @param {number} len how many random numbers to generate.
 * @param {Array} exclude list of elements to omit.
 */
function randomList(next, len, exclude = []) {
  // Convert exclude array to an object for fast lookups.
  let omit = {};
  exclude.forEach(element => omit[element] = true);

  let uniq = {};
  times(len, () => {
    let nextRandom = next(Object.assign({}, omit, uniq));
    uniq[nextRandom] = true;
  });

  return Object.keys(uniq).map(key => {
    return /^-?[0-9]+$/.test(key) ? parseInt(key) : key;
  });
}

/**
 * @param {Function} next generates next random.
 * @param {Object} exclude keys to skip if they show up.
 */
function uniqueRandom(next, exclude) {
  let result;
  do {
    result = next();
  } while (!result || exclude && result in exclude);

  return result;
}
