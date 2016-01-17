/* @flow */

module.exports = function debug(moduleName: string): Function {
  return function(): void {
    if (!process.browser && !process.env.DEBUG) {
      return;
    }

    let args = Array.from(arguments);
    args.unshift(`[${moduleName}]`);
    console.log.apply(console, args);
  };
};
