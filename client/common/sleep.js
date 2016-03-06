/* @flow */

module.exports = function(millis: number): Promise<void> {
  return new Promise((resolve: Function): void => {
    setTimeout(resolve, millis);
  });
};
