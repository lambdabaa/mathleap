/**
 * @fileoverview Call a parameter function on keyboard enter.
 */

module.exports = fn => {
  return event => event.keyCode === 13 ? fn() : true;
};
