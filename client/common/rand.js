/* @flow */

let {isNonNullObject} = require('../common/object');
let times = require('lodash/utility/times');

import type {Numeric} from '../common/types';

/**
 * @param {Function} next generates next random.
 * @param {Object} exclude keys to skip if they show up.
 */
exports.get = function uniqueRandom(next: Function, exclude: ?Array<Numeric> | Object): any {
  let result;
  do {
    result = next();
  } while (isMemberOf(exclude, result));

  return result;
};

/**
 * @param {Function} next generates next random.
 * @param {number} len how many random numbers to generate.
 * @param {Array} exclude list of elements to omit.
 */
exports.list = function(next: Function, len: number, exclude: Array<Numeric> = []): Array<any> {
  // Convert exclude array to an object for fast lookups.
  let omit = {};
  exclude.forEach((element: Numeric): void => {
    omit[element] = true;
  });

  let uniq = {};
  times(len, (): void => {
    let nextRandom = next(Object.assign({}, omit, uniq));
    uniq[nextRandom] = true;
  });

  return Object.keys(uniq).map((key: string): Numeric => {
    return /^-?[0-9]+$/.test(key) ? parseInt(key) : key;
  });
};


function isMemberOf(container: ?Array<Numeric> | Object, element: Numeric): boolean {
  if (!isNonNullObject(container)) {
    return false;
  }

  return Array.isArray(container) ?
    container.includes(element) :
    // $FlowFixMe: isNonNullObject rules out the possibility that container is null.
    element in container;
}
