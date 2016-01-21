/* @flow */

let Firebase = require('firebase/lib/firebase-web');
let debug = require('../../common/debug')('store/wolframs');
let {firebaseUrl} = require('../constants');
let request = require('./request');
let w2 = require('../wolfram2');

let wolframsRef = new Firebase(`${firebaseUrl}/wolframs`);

exports.isEqual = async function(a: string, b: string): Promise<boolean> {
  if (/[a-z]/.test(a) !== /[a-z]/.test(b)) {
    // We want to handle the case of {a: 'w/4=5', b: '20'}
    let aVars = w2.extractVariables(a);
    let bVars = w2.extractVariables(b);
    if (aVars.length === 1) {
      b = `${aVars[0]}=${b}`;
    } else if (bVars.length === 1) {
      a = `${bVars[0]}=${a}`;
    } else {
      return false;
    }
  }

  let res = await readWolframFromCache(a, b);
  if (typeof res === 'boolean') {
    debug('cache hit');
  } else {
    debug('cache miss');
    res = await cacheWolfram(a, b);
  }

  return res;
};

async function cacheWolfram(a: string, b: string): Promise<boolean> {
  let result = await w2.isEqual(a, b);
  let ref = wolframsRef.child(hash(a, b));
  debug('Writing', ref.toString(), result, 'to cache');
  await request(ref, 'set', result);
  return result;
}

function readWolframFromCache(a: string, b: string): Promise<?boolean> {
  let ref = wolframsRef.child(hash(a, b));
  return request(ref, 'once', 'value');
}

function hash(a: string, b: string): string {
  return btoa(JSON.stringify([a, b].sort()))
    .replace('+', '-')
    .replace('/', '_');
}
