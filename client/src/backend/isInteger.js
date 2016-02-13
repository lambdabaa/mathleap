/* @flow */

module.exports = function(num: ?number): boolean {
  if (typeof num !== 'number') {
    return false;
  }

  return /^-?\d+\.?0*$/.test(num.toString());
};
