/* @flow */

let deepEqual = require('lodash/lang/isEqual');
let parse = require('./parse');
let {reduceChar} = require('../common/string');
let stmt = require('../common/stmt');
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
  let {left, right} = stmt.getLeftAndRight(actual);
  return left === expected && /^[a-z]$/.test(right) ||
         right === expected && /^[a-z]$/.test(left);
};

check['2 variable equation'] = function(actual: string, expected: string): boolean {
  let actualParts = stmt.getLeftAndRight(actual);
  let actualLeft = actualParts.left;
  let actualRight = actualParts.right;
  let expectedParts = stmt.getLeftAndRight(expected);
  let expectedLeft = expectedParts.left;
  let expectedRight = expectedParts.right;

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

check['1 variable inequality'] = function(actual: string, expected: string): boolean {
  return actual === expected;
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
  let stmtType = stmt.getStmtType(solution);
  if (stmtType === 'expression') {
    if (isDifferenceOfSquares(solution)) {
      // Special case for difference of squares
      return 'difference of squares';
    }
  }

  let count = getVariables(solution).length;
  return `${count} variable ${stmtType}`;
}

function getVariables(expr: string): Array<string> {
  return Object.keys(
    reduceChar(expr, function(acc: Object, chr: string): Object {
      if (/[a-z]/.test(chr)) {
        acc[chr] = true;
      }

      return acc;
    }, {})
  )
  .sort();
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
