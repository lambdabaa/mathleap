/* @flow */

let deepEqual = require('lodash/lang/isEqual');
let getVariables = require('./getVariables');
let parse = require('./parse');
let stringify = require('./stringify');

import type {AssignmentQuestion} from '../common/types';

let check = {};

check['0 variable expression'] = function(actual: string, expected: string): boolean {
  return actual === expected;
};

/**
 * Parse the expression and make sure it's something like Ax + By + C.
 */
check['1 variable expression'] = check['2 variable expression'] =
    function(actual: string, expected: string): boolean {
  let actualExpr = parse(actual);
  let expectedExpr = parse(expected);

  if (actualExpr.nodeType !== expectedExpr.nodeType) {
    // Uhh
    return false;
  }

  if (actualExpr.data.length !== expectedExpr.data.length) {
    return false;
  }

  return deepEqual(getVariables(actual), getVariables(expected));
};

check['1 variable equation'] = function(actual: string, expected: string): boolean {
  let [left, right] = actual.split('=');
  if (left === expected || right === expected) {
    // Handle the case of actual => 'x=10', expected => '10'
    return true;
  }

  return false;
};

check['2 variable equation'] = function(actual: string, expected: string): boolean {
  let [actualLeft, actualRight] = actual.split('=');
  let [expectedLeft, expectedRight] = expected.split('=');

  if (actualLeft === expectedLeft) {
    return check['1 variable expression'](actualRight, expectedRight);
  }

  if (actualLeft === expectedRight) {
    return check['1 variable expression'](actualRight, expectedLeft);
  }

  if (actualRight === expectedRight) {
    return check['1 variable expression'](actualLeft, expectedLeft);
  }

  return false;
};

check['difference of squares'] = function(actual: string, expected: string): boolean {
  let [actualLeft, actualRight] = parse(actual).data[0].value.data
    .map((x: Object): Object => x.value);
  let [expectedLeft, expectedRight] = parse(expected).data[0].value.data
    .map((x: Object): Object => x.value);
  return deepEqual(actualLeft, expectedLeft) && deepEqual(actualRight, expectedRight) ||
         deepEqual(actualLeft, expectedRight) && deepEqual(actualRight, expectedLeft);
};

function getAnswerType(solution: string): string {
  let isEquation = solution.indexOf('=') !== -1;
  if (!isEquation) {
    if (isDifferenceOfSquares(solution)) {
      // Special case for difference of squares
      return 'difference of squares';
    }
  }

  let count = getVariables(solution).length;
  return `${count} variable ${isEquation ? 'equation' : 'expression'}`;
}

function isDifferenceOfSquares(expr: string) {
  let parsed = parse(expr);
  if (parsed.data.length !== 1) {
    return false;
  }

  let {nodeType, data} = parsed.data[0].value;
  if (nodeType !== 'factorlist') {
    return false;
  }

  if (data.length !== 2) {
    return false;
  }

  let [a, b] = data
    .map(function(element: Object): any {
      return stringify(element.value);
    })
    .map(getVariables);

  if (!a.length) {
    return false;
  }

  return deepEqual(a, b);
}

module.exports = function(aQuestion: AssignmentQuestion, answer: string): boolean {
  let solution = aQuestion.solution.toString();
  let expectedType = getAnswerType(solution);
  let actualType = getAnswerType(answer);
  if (actualType !== expectedType) {
    // There is a special case where the solution is '10' and the
    // answer is 'x=10'
    if (expectedType !== '0 variable expression' || actualType !== '1 variable equation') {
      return false;
    }
  }

  return check[actualType](answer, solution);
};
