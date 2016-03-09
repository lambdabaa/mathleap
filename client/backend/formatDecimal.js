/* @flow */

module.exports = function(f: number, places: number = 2): string {
  let result = f.toFixed(places);
  while (result.endsWith('0')) {
    result = result.slice(0, result.length - 1);
  }

  if (result.endsWith('.')) {
    result += '0';
  }

  return result;
};
