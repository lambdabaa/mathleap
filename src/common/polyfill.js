/* @flow */
/**
 * @fileoverview Load a polyfill iff not available in the platform.
 */

let debug = console.log.bind(console, '[polyfill]');

module.exports = function(api: string, moduleName: string): Function {
  if (typeof self !== 'undefined' && api in self) {
    debug(`real ${api}`);
    return self[api];
  }

  debug(`fake ${api} provided by ${moduleName}`);
  // $FlowFixMe: Is it possible to do this sort of api override with flow?
  let module = require(moduleName);
  return api in module ? module[api] : module;
};
