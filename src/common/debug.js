/* @flow */

let {parse} = require('querystring');

module.exports = function debug(moduleName: string): Function {
  return function(): void {
    if (process.browser) {
      let params = parse(location.search.substring(1));
      if (!('secretDebugMode' in params)) {
        return;
      }
    } else {
      if (!process.env.DEBUG) {
        return;
      }
    }

    let args = Array.from(arguments);
    args.unshift(`[${moduleName}]`);
    console.log.apply(console, args);
  };
};
