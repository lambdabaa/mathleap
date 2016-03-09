/* @flow */

let mathjs = require('mathjs');

let fraction = mathjs.create({number: 'fraction'});
let {format} = fraction;

fraction.format = (frac: Object): string => {
  let [num, denom] = format(frac).split('/');
  return denom === '1' ? num : `${num}/${denom}`;
};

fraction.toDecimal = (input: Object|string): number => {
  if (typeof input === 'string') {
    input = mathjs.eval(input);
  }

  return input.s * input.n / input.d;
};

module.exports = fraction;
