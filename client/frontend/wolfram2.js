/* @flow */

let Xhr = require('./xhr');
let {apiUrl} = require('./constants');
let debug = require('../common/debug')('wolfram2');
let flatten = require('lodash/array/flatten');
let {mapChar} = require('../common/string');
let querystring = require('querystring');
let uniq = require('lodash/array/uniq');

/**
 * a and b are math expressions and we'll figure out
 * whether they're equivalent.
 */
exports.isEqual = async function(a: string, b: string,
                                 instruction: string = ''): Promise<boolean> {
  debug('check equivalence', a, b);
  let check = a.indexOf('==') !== -1 ? 'Equation' : 'Expr';
  let url = `${apiUrl}/equal/`;
  let vars = exports.getVariables(a, b, instruction);
  debug('vars', JSON.stringify(vars));
  let req = new Xhr();
  req.open(
    'GET',
    `${url}?${querystring.stringify({check, a, b, vars})}`,
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

exports.getVariables = function(a: string, b: string, instruction: string): string {
  let re = /^Evaluate when [a-z] is -?\d+( and [a-z] is -?\d+)*\.$/;
  if (!re.test(instruction)) {
    let vars = exports.extractVariablesFromMany(a, b);
    return `{${vars.length ? vars.join(',') : 'x'}}`;
  }

  let matches = instruction.match(/[a-z] is -?\d+/g);
  if (!Array.isArray(matches)) {
    return '{}';
  }

  matches = matches.map((aMatch: string): string => aMatch.replace(' is ', '=='));
  return `{${matches.join(',')}}`;
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
