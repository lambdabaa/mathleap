/* @flow */

let {reduceChar} = require('../common/string');

module.exports = function(expr: string): Array<string> {
  return Object.keys(
    reduceChar(expr, function(acc: Object, chr: string): Object {
      if (/[a-z]/.test(chr)) {
        acc[chr] = true;
      }

      return acc;
    }, {})
  )
  .sort();
};
