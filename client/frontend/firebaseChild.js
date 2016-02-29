/* @flow */
/**
 * @fileoverview Wrapper around reactfire quirks.
 */

exports.findByKey = function(parent: ?Array<Object>, key: string): ?Object {
  if (!Array.isArray(parent)) {
    return null;
  }

  let child = parent.find((aChild: Object): boolean => aChild['.key'] === key);
  if (child == null) {
    return child;
  }

  return child['.value'];
};

exports.findArrayChild = function(parent: ?Array<Object | Array<any>>): Array<any> {
  if (!Array.isArray(parent)) {
    return [];
  }

  // $FlowFixMe
  return parent.find((child: Object | Array<any>): boolean => Array.isArray(child)) || [];
};
