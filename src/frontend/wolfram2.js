/* @flow */

let Xhr = require('./xhr');
let debug = require('../common/debug')('wolfram2');
let flatten = require('lodash/array/flatten');
let {mapChar} = require('../common/string');
let querystring = require('querystring');
let uniq = require('lodash/array/uniq');
let {wolframCloudUrl} = require('./constants');

/**
 * a and b are math expressions and we'll figure out
 * whether they're equivalent.
 */
exports.isEqual = async function(a: string, b: string): Promise<boolean> {
  debug('check equivalence', a, b);
  let vars = exports.extractVariablesFromMany(a, b);
  vars = `{${vars.length ? vars.join(',') : 'x'}}`;
  let req = new Xhr();
  req.open(
    'GET',
    `${wolframCloudUrl}?${querystring.stringify({a, b, vars})}`,
    true /* async */
  );

  let res = await req.send();
  debug('equivalent', a, b, res);
  switch (res) {
    case 'True':
      return true;
    case 'False':
      return false;
    default:
      throw new Error(`Unable to parse response from wolfram ${res}`);
  }
};

exports.extractVariablesFromMany = function(...arr: Array<string>): Array<string> {
  return uniq(flatten(arr.map(exports.extractVariables)));
};

exports.extractVariables = function(expr: string): Array<string> {
  return triplets(expr)
    .filter((triplet: Array<?string>): boolean => {
      return !isLowerCase(triplet[0]) &&
             isLowerCase(triplet[1]) &&
             !isLowerCase(triplet[2]);
    })
    // $FlowFixMe: We know that the first element is indeed a string.
    .map((triplet: Array<?string>): string => {
      return triplet[1];
    });
};

function triplets(str: string): Array<Array<?string>> {
  switch (str.length) {
    case 0:
      return [];
    case 1:
      return [[null, str, null]];
    default:
      return mapChar(str, function(chr, i): Array<?string> {
        return [
          i === 0 ? null : str.charAt(i - 1),
          chr,
          i  + 1 === str.length ? null : str.charAt(i + 1)
        ];
      });
  }
}

function isLowerCase(chr: ?string) {
  if (typeof chr !== 'string') {
    return false;
  }

  let charCode = chr.charCodeAt(0);
  return charCode > 96 && charCode < 123;
}
