/**
 * @fileoverview Load a polyfill iff not available in the platform.
 */

module.exports = function(api, moduleName) {
  if (typeof self !== 'undefined' && api in self) {
    return self[api];
  }

  return require(moduleName);
};
