/* @flow */

function getNestedKeyValue(obj: any, key: string): any {
  if (typeof obj !== 'object' || !obj) {
    return null;
  }

  let keys = Object.keys(obj);
  if (!keys.length) {
    return null;
  }

  if (key in obj) {
    return obj[key];
  }

  return keys
    .map((aKey: string): any => getNestedKeyValue(obj[aKey], key))
    .reduce((prev: any, curr: any): any => prev != null ? prev : curr, null);
}

module.exports = getNestedKeyValue;
