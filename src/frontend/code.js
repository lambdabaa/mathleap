/**
 * @fileoverview Generate pseudo unique class identifiers.
 */

let random = require('lodash/number/random');
let range = require('lodash/utility/range');
let times = require('lodash/utility/times');

let alphabet = range(48, 58)  // 10: 0-9
  .concat(range(65, 79))      // 14: A-N
  .concat(range(80, 91))      // 11: P-Z
  .concat(range(97, 123))     // 26: a-z
  .concat([33, 37, 43, 45, 61, 95, 126])  // 7: !, %, +, -, =, _, ~
  .map(String.fromCharCode)
  .map(chr => chr.length > 1 ? chr[0] : chr);

exports.create = function() {
  // First create a number from 3 hex digits and the 3-13th timestamp digits.
  return exports.encode(
    random(1, 16) *
    random(1, 16) *
    random(1, 16) *
    parseInt(new Date().getTime().toString().slice(2))
  );
};

exports.encode = function(input) {
  return times(8, () => {
    let digit = input % 68;  // 68 is alphabet size.
    input = Math.floor(input / 68);
    return digit;
  })
  .map(digit => alphabet[digit])
  .join('');
};
