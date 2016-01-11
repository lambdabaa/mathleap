/* @flow */
/**
 * @fileoverview Utility methods to generate random data.
 */

let random = require('lodash/number/random');
let range = require('lodash/utility/range');
let sample = require('lodash/collection/sample');
let times = require('lodash/utility/times');

import type {
  Numeric,
  Range
} from '../common/types';

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
exports.boundedFraction = boundedFraction;
exports.compositeFraction = uniqueRandom.bind(exports, compositeFraction);
exports.fractionList = randomList.bind(exports, exports.fraction);
exports.compositeFractionList = randomList.bind(exports, exports.compositeFraction);
exports.boolean = sample.bind(null, [true, false]);
exports.letter = sample.bind(null, chrs);


function randomFraction(): string {
  return assignToFraction(exports.integer);
}

function compositeFraction(): string {
  return assignToFraction(exports.composite);
}

function assignToFraction(numberGenerator: Function): string {
  let a = numberGenerator([0] /* can't divide by 0 */);
  let b = numberGenerator([0, a, -a] /* can't divide by 0 */);
  if (a === b || a === -b) {
    b++;
  }
  let numerator, denominator;
  if (Math.abs(a) > Math.abs(b)) {
    denominator = a;
    numerator = b;
  } else {
    denominator = b;
    numerator = a;
  }
  return `${numerator}/${denominator}`;
}

function absBoundedRandomInteger(lower: number, upper: number): number {
  return Math.floor(Math.random() * (Math.abs(upper) - Math.abs(lower))) + Math.abs(lower);
}

function boundedFraction(bounds: {numerator: Range; denominator: Range}): string {
  let numerator = absBoundedRandomInteger(bounds.numerator.start, bounds.numerator.end);
  bounds.denominator.start = Math.max(numerator, bounds.denominator.start); // To avoid top heavy fractions
  let denominator = absBoundedRandomInteger(bounds.denominator.start, bounds.denominator.end);
  return `${numerator}/${denominator}`;
}

exports.nonZero = function(): number {
  let magnitude = random(1, 25);
  let negative = exports.boolean();
  return negative ? -magnitude : magnitude;
};

/**
 * TODO: There are better ways to do this...
 */
function randomFactor(value: number): number {
  let positives = range(2, Math.floor(Math.sqrt(Math.abs(value))) + 1);
  let negatives = positives.map(positive => -positive);
  return sample(
    positives
      .concat(negatives)
      .filter((candidate: number): boolean => {
        return value % candidate === 0 || value % candidate === -0;
      })
  );
}

exports.factor = function(value: number, exclude: ?Array<Numeric> | Object): number {
  let gen = randomFactor.bind(null, value);
  return uniqueRandom(gen, exclude);
};

exports.compositeFactor = function(value: number): number {
  return sample(
    composites.filter((candidate: number): boolean => {
      return value % candidate === 0 || value % candidate === -0;
    })
  );
};

function randomPower(): number {
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
function randomList(next: Function, len: number, exclude: Array<Numeric> = []): Array<any> {
  // Convert exclude array to an object for fast lookups.
  let omit = {};
  exclude.forEach((element: Numeric): void => {
    omit[element] = true;
  });

  let uniq = {};
  times(len, (): void => {
    let nextRandom = next(Object.assign({}, omit, uniq));
    uniq[nextRandom] = true;
  });

  return Object.keys(uniq).map((key: string): Numeric => {
    return /^-?[0-9]+$/.test(key) ? parseInt(key) : key;
  });
}

/**
 * @param {Function} next generates next random.
 * @param {Object} exclude keys to skip if they show up.
 */
function uniqueRandom(next: Function, exclude: ?Array<Numeric> | Object): any {
  let result;
  do {
    result = next();
  } while (exclude && result in exclude);

  return result;
}
