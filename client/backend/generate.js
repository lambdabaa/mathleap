/* @flow */
/**
 * @fileoverview Utility methods to generate random data.
 */

let fraction = require('./fraction');
let normalizeFraction = require('./normalizeFraction');
let rand = require('./rand');
let range = require('lodash/utility/range');
let sample = require('lodash/collection/sample');

import type {Numeric, Range} from '../common/types';

const integers = Object.freeze([
  -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2,
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
]);

const composites = Object.freeze([
  -4, -6, -8, -9,
  -10, -12, -14, -15, -16, -18,
  -20, -21, -22, -24, -25,
  4, 6, 8, 9,
  10, 12, 14, 15, 16, 18,
  20, 21, 22, 24, 25
]);

const superComposites = Object.freeze([
  -12, -16, -18, -20, -24,
  -30, -32, -36,
  12, 16, 18, 20, 24
]);

const largeComposites = Object.freeze([
  10, 12, 14, 15, 16, 18,
  20, 21, 22, 24, 25, 26,
  27, 28, 30
]);

const chrs = Object.freeze([
  'a', 'b', 'c',
  'g', 'h', 'j',
  'k', 'm', 'n', 'p',
  'q', 'r', 's', 't', 'u',
  'v', 'w', 'x', 'y', 'z'
]);

const singleDigits = range(1, 10);

function singleDigit(): number {
  return sample(singleDigits);
}

function randomFloat(): number {
  let integral = sample(singleDigits);
  let decimal = Math.random() > 0.25 ?
    singleDigit() :
    10 * singleDigit() + singleDigit();
  return parseFloat(`${integral}.${decimal}`);
}

function randomBoundedFloat(low: number = 0, high: number = 100): number {
  let result;
  do {
    result = randomFloat();
  } while (result <= low || result >= high);

  return result;
}

function randomPower(): number {
  let small = range(-10, 10);
  let tiny = range(0, 3);
  let base = sample(small);
  let exp = sample(tiny);
  return Math.pow(base, exp);
}

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

function factor(value: number, exclude: ?Array<Numeric> | Object): number {
  let gen = randomFactor.bind(null, value);
  return rand.get(gen, exclude);
}

function randomPositiveFactor(value: number): number {
  let positives = range(2, Math.floor(Math.sqrt(Math.abs(value))) + 1);
  return sample(
    positives.filter((candidate: number): boolean => {
      return value % candidate === 0;
    })
  );
}

function positiveFactor(value: number, exclude: ?Array<Numeric> | Object): number {
  let gen = randomPositiveFactor.bind(null, value);
  return rand.get(gen, exclude);
}

function compositeFactor(value: number): number {
  return sample(
    composites.filter((candidate: number): boolean => {
      return value % candidate === 0 || value % candidate === -0;
    })
  );
}

function assignToFraction(numberGenerator: Function): string {
  let a = numberGenerator([0] /* can't divide by 0 */);
  let b = numberGenerator([0, a, -a] /* can't divide by 0 */);

  let numerator, denominator;
  if (Math.abs(a) > Math.abs(b)) {
    denominator = a;
    numerator = b;
  } else {
    denominator = b;
    numerator = a;
  }

  let result = normalizeFraction(numerator, denominator);
  try {
    return fraction.format(fraction.fraction(result));
  } catch (error) {
    throw new Error(`mathjs didn't like ${result}`);
  }
}

function absBoundedInteger(lower: number, upper: number): number {
  return sample(range(Math.abs(lower), Math.abs(upper)));
}

function boundedFraction(bounds: {numerator: Range; denominator: Range}): string {
  let numerator = absBoundedInteger(
    bounds.numerator.start,
    bounds.numerator.end
  );

  let denominator = absBoundedInteger(
    Math.max(numerator, bounds.denominator.start),  // To avoid improper fractions.
    bounds.denominator.end
  );

  return `${numerator}/${denominator}`;
}

let composite = rand.get.bind(rand, sample.bind(null, composites));
let largeComposite = rand.get.bind(rand, sample.bind(null, largeComposites));
let integer = rand.get.bind(rand, sample.bind(null, integers));

exports.absBoundedInteger = absBoundedInteger;
exports.boolean = sample.bind(null, [true, false]);
exports.boundedFloat = randomBoundedFloat;
exports.boundedFraction = boundedFraction;
exports.chrs = chrs;
exports.composite = composite;
exports.compositeFactor = compositeFactor;
exports.compositeFraction = rand.get.bind(rand, assignToFraction.bind(exports, composite));
exports.compositeFractionList = rand.list.bind(rand, exports.compositeFraction);
exports.compositeList = rand.list.bind(rand, exports.composite);
exports.composites = composites;
exports.factor = factor;
exports.factorList = rand.list.bind(rand, factor);
exports.float = rand.get.bind(rand, randomFloat);
exports.floatList = rand.list.bind(rand, exports.float);
exports.fraction = rand.get.bind(rand, assignToFraction.bind(exports, integer));
exports.fractionList = rand.list.bind(rand, exports.fraction);
exports.integer = integer;
exports.integerList = rand.list.bind(rand, exports.integer);
exports.largeComposite = largeComposite;
exports.largeCompositeList = rand.list.bind(rand, exports.largeComposite);
exports.letter = rand.get.bind(rand, sample.bind(null, chrs));
exports.positiveFactor = positiveFactor;
exports.positiveFactorList = rand.list.bind(rand, positiveFactor);
exports.power = rand.get.bind(rand, randomPower);
exports.powerList = rand.list.bind(rand, exports.power);
exports.superComposite = rand.get.bind(rand, sample.bind(null, superComposites));
exports.superComposites = superComposites;
exports.superCompositeList = rand.list.bind(rand, exports.superComposite);
