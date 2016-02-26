/* @flow */

let deepEqual = require('lodash/lang/isEqual');

exports.isNegativeOne = function(node: Node): boolean {
  return deepEqual(node, {
    value: {
      nodeType: 'atom',
      data: ['number', -1]
    },
    invert: false
  });
};
