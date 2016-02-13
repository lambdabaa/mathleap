/* @flow */
/**
 * @fileoverview Call a parameter function on keyboard enter.
 */

module.exports = function(fn: Function): any {
  return event => event.keyCode === 13 ? fn() : true;
};
