/* @flow */

exports.isNonNullObject = function(x: any): boolean {
  return x && typeof x === 'object';
};
