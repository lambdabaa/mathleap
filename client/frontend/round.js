/* @flow */

module.exports = function(x: number): number {
  let ceil = Math.ceil(x);
  let floor = Math.floor(x);
  return Math.abs(ceil - x) > 0.5 ? floor : ceil;
};
