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

fraction.equals = (one: Object|string, other: Object|string): boolean => {
  if (typeof one === 'string') {
    one = fraction.eval(one);
  }

  if (typeof other === 'string') {
    other = fraction.eval(other);
  }

  // $FlowFixMe
  return ['n', 'd'].every(field => one[field] === other[field]);
};

module.exports = fraction;
