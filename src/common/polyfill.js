/* @flow */
/**
 * @fileoverview Load a polyfill iff not available in the platform.
 */

module.exports = function(api: string, moduleName: string): Function {
  if (typeof self !== 'undefined' && api in self) {
    return self[api];
  }

  // $FlowFixMe: Is it possible to do this sort of api override with flow?
  let module = require(moduleName);
  return api in module ? module[api] : module;
};
