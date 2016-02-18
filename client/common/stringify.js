/* @flow */
/**
 * @fileoverview Very paranoid JSON.stringify so that we don't break while trying to
 *     log non mission critical stuff in production.
 */

let jsonStringify = require('json-stringify-safe');

module.exports = function stringify(obj: Array<any> | Object): string {
  let result;
  try {
    result = jsonStringify(obj);
  } catch (error) {
    console.error(error.toString());
    result = '{}';
  }

  return result;
};
