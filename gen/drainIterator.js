/* @flow */
/* global Generator */

module.exports = function(it: Generator): Array<any> {
  let result = [];
  for (let next of it) {
    result.push(next);
  }

  return result;
};
