/* @flow */

let deepEqual = require('lodash/lang/isEqual');
let getNestedKeyValue = require('./getNestedKeyValue');

import type {Node} from './parse';

exports.isNegativeOne = function(node: Node): boolean {
  let nodeType = getNestedKeyValue(node, 'nodeType');
  let data = getNestedKeyValue(node, 'data');
  return nodeType === 'atom' && deepEqual(data, ['number', -1]);
};

exports.isConstant = function(node: Node): boolean {
  let nodeType = getNestedKeyValue(node, 'nodeType');
  let data = getNestedKeyValue(node, 'data');
  return nodeType === 'atom' && data[0] === 'number';
};

exports.isVariable = function(node: Node): boolean {
  let nodeType = getNestedKeyValue(node, 'nodeType');
  let data = getNestedKeyValue(node, 'data');
  return nodeType === 'atom' && data[0] === 'variable';
};
