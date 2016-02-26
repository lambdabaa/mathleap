/* @flow */
/**
 * @fileoverview Conversion from parsed math tree to TeX.
 */

let {isNegativeOne} = require('./mathNode');
let parse = require('./parse');
let {partition} = require('../common/array');

import type {Node} from './parse';

let symbol = Object.freeze({
  equals: '=',
  lt: '<',
  lteq: '\\lte',
  gteq: '\\gte',
  gt: '>'
});

let handleNode = {
  statement(node: Node): string {
    let [statement, left, right] = node.data;
    return `${texifyNode(left)}${symbol[statement]}${texifyNode(right)}`;
  },

  termlist(node: Node, parentPriority: number): string {
    let result = node.data
      .map(function(term: Object, index: number): string {
        return index === 0 ?
          `${term.negate ? '-' : ''}${texifyNode(term.value, 2)}` :
          `${term.negate ? '-' : '+'}${texifyNode(term.value, 2)}`;
      })
      .join('');

    return parentPriority < 2 ? `\\left(${result}\\right)` : result;
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

    let topstring = top.length ? texifyFactors(top) : '1';
    if (!bottom.length) {
      return negateTop ? `-${topstring}` : topstring;
    }

    let bottomstring = texifyFactors(bottom);
    let result = `\\frac{${topstring}}{${bottomstring}}`;
    if (negateTop !== negateBottom) {
      result = `-${result}`;
    }

    return parentPriority < 1 ? `\\left(${result}\\right)` : result;
  },

  fun(node: Node): string {
    let funType = node.data[0];
    switch (funType) {
      case 'abs':
        return `|${texifyNode(node.data[1])}|`;
      case 'power':
        return `${texifyNode(node.data[1], 0)}^{${texifyNode(node.data[2], 0)}}`;
      default:
        throw new Error(`Unrecognized funType ${funType}`);
    }
  },

  atom(node: Node): string {
    return node.data[1].toString();
  }
};

function texify(node: Node | string): string {
  if (typeof node === 'string') {
    node = parse(node);
  }

  return texifyNode(node);
}

function texifyNode(node: Node, parentPriority: number = Infinity): string {
  return handleNode[node.nodeType](node, parentPriority);
}

function texifyFactors(factors: Array<Object>): string {
  return factors
    .map((factor: Object): string => texifyNode(factor.value, 1))
    .join('\\cdot ');
}

module.exports = texify;
