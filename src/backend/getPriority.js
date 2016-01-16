/* @flow */

let parse = require('./parse');

import type Node from './parse';

/**
 * 0: add, subtract
 * 1: multiply
 * 2: divide
 * 3: fun
 * 4: atom
 */
module.exports = function getPriority(expression: Node | string): number {
  let node = maybeParse(expression);
  let {nodeType, data} = node;
  if (data.length === 1) {
    return getPriority(data[0].value);
  }

  switch (nodeType) {
    case 'termlist':
      return 0;
    case 'factorlist':
      return isDivide(node) ? 2 : 1;
    case 'fun':
      return 3;
    case 'atom':
      return 4;
    default:
      throw new Error(`Unexpected nodeType ${node.nodeType}`);
  }
};

function maybeParse(expression: Node | string): Node {
  if (typeof expression !== 'string') {
    return expression;
  }

  try {
    return parse(expression);
  } catch (error) {
    throw new Error(`Failed to parse ${expression}: ${error.message}`);
  }
}

function isDivide(factorlist: Node): boolean {
  return factorlist.data.some((factor: Object): boolean => factor.invert);
}
