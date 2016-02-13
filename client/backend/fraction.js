/* @flow */

let mathjs = require('mathjs');

mathjs.config({number: 'fraction'});

let {format} = mathjs;

mathjs.format = (frac: Object): string => {
  let [num, denom] = format(frac).split('/');
  return denom === '1' ? num : `${num}/${denom}`;
};

mathjs.toDecimal = (input: Object|string): number => {
  if (typeof input === 'string') {
    input = mathjs.eval(input);
  }

  return input.s * input.n / input.d;
};

module.exports = mathjs;
