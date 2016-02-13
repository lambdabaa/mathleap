/* @flow */
/**
 * @fileoverview Array utility methods.
 */

/**
 * Creates two arrays where the elements of one pass the test
 * and the elements of the other fail the test.
 */
exports.partition = function(arr: Array<any>, fn: (x: any) => boolean,
                             pass: Array<any> = [], fail: Array<any> = []): Array<Array<any>> {
  if (arr.length === 0) {
    return [pass, fail];
  }

  let [head, ...tail] = arr;
  return fn(head) ?
    exports.partition(tail, fn, pass.concat(head), fail) :
    exports.partition(tail, fn, pass, fail.concat(head));
};

/**
 * Like Array.prototype.splice().
 */
exports.replaceIndex = function(arr: Array<any>, index: number,
                                element: Array<any> | any): Array<any> {
  return arr.slice(0, index)
    .concat(element)
    .concat(arr.slice(index + 1));
};

/**
 * Similar to Array.prototype.some() except that it returns the result
 * of applying the test function instead of the key.
 */
exports.someValue = function(arr: Array<any>,
                             fn: (x: any, i: number) => any): any {
  let result;
  for (let i = 0; i < arr.length; i++) {
    result = fn(arr[i], i);
    if (result !== false && result != null) {
      return result;
    }
  }

  return false;
};
