/* @flow */
/**
 * @fileoverview Utility methods for strings.
 */

exports.mapChar = function(str: string, fn: (chr: string, i: number) => any): Array<any> {
  let result = [];
  exports.eachChar(str, (chr, index) => result.push(fn(chr, index)));
  return result;
};

exports.eachChar = function(str: string, fn: (chr: string, i: number) => any): void {
  for (let i = 0; i < str.length; i++) {
    let chr = str.charAt(i);
    fn(chr, i);
  }
};
