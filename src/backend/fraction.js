/* @flow */

let mathjs = require('mathjs');

mathjs.config({number: 'fraction'});

let {format} = mathjs;
mathjs.format = (frac: Object): string => {
  let [num, denom] = format(frac).split('/');
  return denom === '1' ? num : `${num}/${denom}`;
};

module.exports = mathjs;
