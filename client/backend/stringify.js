/* @flow */
/**
 * @fileoverview Conversion from parsed math tree to string.
 */

let {isNegativeOne} = require('./mathNode');
let {partition} = require('../common/array');

import type {Node} from './parse';

let symbol = Object.freeze({
  equals: '=',
  lt: '<',
  lteq: '≤',
  gteq: '≥',
  gt: '>'
});

let handleNode = {
  statement(node: Node): string {
    let [statement, left, right] = node.data;
    return `${stringify(left)} ${symbol[statement]} ${stringify(right)}`;
  },

  termlist(node: Node, parentPriority: number): string {
    let result = node.data
      .map(function(term: Object, index: number): string {
        return index === 0 ?
          `${term.negate ? '-' : ''}${stringify(term.value, 2)}` :
          `${term.negate ? '-' : '+'} ${stringify(term.value, 2)}`;
      })
      .join(' ');

    return parentPriority < 2 ? `(${result})` : result;
  },

  factorlist(node: Node, parentPriority: number): string {
    let [top, bottom] = partition(
      node.data,
      (factor: Object): boolean => !factor.invert
    );

    let negateTop = false;
    if (top.length > 1 && isNegativeOne(top[0])) {
      top = top.slice(1);
      negateTop = true;
    }

    let negateBottom = false;
    if (bottom.length > 1 && isNegativeOne(bottom[0])) {
      bottom = bottom.slice(1);
      negateBottom = true;
    }

    let topstring = top.length ? stringifyFactors(top) : '1';
    if (!bottom.length) {
      return negateTop ? `-${topstring}` : topstring;
    }

    if (top.length > 1) {
      topstring = `(${topstring})`;
    }

    let bottomstring = stringifyFactors(bottom);
    if (bottom.length > 1) {
      bottomstring = `(${bottomstring})`;
    }

    let result = `${topstring} / ${bottomstring}`;
    if (negateTop !== negateBottom) {
      result = `-${result}`;
    }

    return parentPriority < 1 ? `(${result})` : result;
  },

  fun(node: Node): string {
    let funType = node.data[0];
    switch (funType) {
      case 'abs':
        return `|${stringify(node.data[1])}|`;
      case 'power':
        return `${stringify(node.data[1], 0)} ^ ${stringify(node.data[2], 0)}`;
      default:
        throw new Error(`Unrecognized funType ${funType}`);
    }
  },

  atom(node: Node): string {
    return node.data[1].toString();
  }
};

function stringify(node: Node, parentPriority: number = Infinity): string {
  return handleNode[node.nodeType](node, parentPriority);
}

function stringifyFactors(factors: Array<Object>): string {
  return factors
    .map((factor: Object): string => stringify(factor.value, 1))
    .join(' * ');
}

module.exports = stringify;
