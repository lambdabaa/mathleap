let mathjs = require('mathjs');

mathjs.config({number: 'fraction'});

let format = mathjs.format;
mathjs.format = frac => {
  let [num, denom] = format(frac).split('/');
  return denom === '1' ? num : `${num}/${denom}`;
};

module.exports = mathjs;
