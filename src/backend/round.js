/* @flow */

/**
 * Hack around things like Math.pow(125, 1 / 3) = 4.99999999999.
 */
module.exports = function(x: number): number {
  let floor = Math.floor(x);
  let ceil = Math.ceil(x);
  return [floor, ceil, x].find(p => Math.abs(x - p) < 0.0000000001);
};
