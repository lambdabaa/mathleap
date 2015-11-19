/**
 * @fileoverview Array utility methods.
 */
exports.partition = (arr, fn, pass = [], fail = []) => {
  if (arr.length === 0) {
    return [pass, fail];
  }

  let [head, ...tail] = arr;
  return fn(head) ?
    exports.partition(tail, fn, pass.concat(head), fail) :
    exports.partition(tail, fn, pass, fail.concat(head));
};

exports.replaceIndex = (arr, index, element) => {
  return arr.slice(0, index)
    .concat(element)
    .concat(arr.slice(index + 1));
};
