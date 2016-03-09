/* @flow */

type RGB = {
  r: number;
  g: number;
  b: number;
};

module.exports = function(initial: RGB, target: RGB, magnitude: number): RGB {
  let diffR = target.r - initial.r;
  let diffG = target.g - initial.g;
  let diffB = target.b - initial.b;
  return {
    r: initial.r + magnitude * diffR,
    g: initial.g + magnitude * diffG,
    b: initial.b + magnitude * diffB
  };
};
