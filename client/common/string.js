/* @flow */
/**
 * @fileoverview Utility methods for strings.
 */

exports.mapChar = function(str: string, fn: (chr: string, i: number) => any): Array<any> {
  let result = [];
  exports.eachChar(str, function(chr: string, index: number): void {
    result.push(fn(chr, index));
  });

  return result;
};

exports.eachChar = function(str: string, fn: (chr: string, i: number) => any): void {
  for (let i = 0; i < str.length; i++) {
    let chr = str.charAt(i);
    fn(chr, i);
  }
};

exports.reduceChar = function(
    str: string,
    fn: (acc: any, chr: string, i: number) => any,
    seed: any): any {
  let acc = seed != null ? seed : 0;
  exports.eachChar(str, function(chr: string, i: number): void {
    acc = fn(acc, chr, i);
  });

  return acc;
};
