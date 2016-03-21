/* @flow */
/**
 * @fileoverview Conversion from parsed math tree to TeX.
 */

let mathNode = require('./mathNode');
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
    node = flattenFactorlist(node);
    let [top, bottom] = partition(
      node.data,
      (factor: Object): boolean => !factor.invert
    );

    let negateTop = false;
    if (top.length > 1 && mathNode.isNegativeOne(top[0])) {
      top = top.slice(1);
      negateTop = true;
    }

    let negateBottom = false;
    if (bottom.length > 1 && mathNode.isNegativeOne(bottom[0])) {
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
  if (factors.length === 2 &&
      mathNode.isConstant(factors[0]) &&
      mathNode.isVariable(factors[1])) {
    // Special case for Ax
    return texifyNode(factors[0].value, 1) + texifyNode(factors[1].value, 1);
  }

  if (factors.length === 3 &&
      mathNode.isNegativeOne(factors[0]) &&
      mathNode.isConstant(factors[1]) &&
      mathNode.isVariable(factors[2])) {
    // -Ax
    return '-' + texifyNode(factors[1].value, 1) + texifyNode(factors[2].value, 1);
  }

  return factors
    .map((factor: Object): string => texifyNode(factor.value, 1))
    .join('\\cdot ');
}

// Problem is nested factorlists:
//
// {
//   "nodeType": "factorlist",
//   "data": [
//     {
//       "value": {
//         "nodeType": "factorlist",
//         "data": [
//           {
//             "value": {
//               "nodeType": "atom",
//               "data": ["number",-1]
//             },
//             "invert":false
//           },
//           {
//             "value": {
//               "nodeType": "atom",
//               "data": ["number","17"]
//             },
//             "negate":false
//           }
//         ]
//       },
//       "invert":false
//     },
//     {
//       "value": {
//         "nodeType": "atom",
//         "data": ["variable", "b"]
//       },
//       "invert": false
//     }
//   ]
// }
//
// Not sure why this is being parsed but adding hack
// to handle here until we do more investigation.
function flattenFactorlist(node: Node): Node {
  let factors = [];
  let queue = node.data;

  while (queue.length) {
    let {value, invert} = queue.shift();
    if ('invert' in value) {
      invert = invert !== value.invert;
    }

    if (value.nodeType !== 'factorlist') {
      factors.push({value, invert});
      continue;
    }

    queue = value.data.concat(queue);
  }

  node.data = factors;
  return node;
}

module.exports = texify;
