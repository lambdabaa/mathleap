/* @flow */
/**
 * @fileoverview MathLeap color palette.
 */

let rand = require('../common/rand');
let sample = require('lodash/collection/sample');

exports.colors = [
  '#e95b50',
  '#ff9f65',
  '#ffd93f',
  '#b0eb3f',
  '#3fc7ae',
  '#6ab0f4',
  '#6d3fc7',
  '#ff3f7c',
  '#eb241d',
  '#ff8033',
  '#fc0',
  '#96e400',
  '#00b494',
  '#3996f0',
  '#3d00b4',
  '#ff0051',
  '#aa1c11',
  '#c06026',
  '#c09a00',
  '#71ac00',
  '#00886f',
  '#2b71b5',
  '#2e0088',
  '#c0003d'
];

let randomColor = sample.bind(null, exports.colors);

exports.getPalette = function(cols: number): Array<Array<string>> {
  return exports.colors.reduce(
    function(result: Array<Array<string>>, color: string, index: number): Array<Array<string>> {
      if (index % cols === 0) {
        result.push([]);
      }

      let last = result[result.length - 1];
      last.push(color);
      return result;
    },
    []
  );
};

exports.random = rand.get.bind(rand, randomColor);
