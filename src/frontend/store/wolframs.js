/* @flow */

let Firebase = require('firebase/lib/firebase-web');
let debug = require('../../common/debug')('store/wolframs');
let {firebaseUrl} = require('../constants');
let request = require('./request');
let wolfram = require('../wolfram');

let wolframsRef = new Firebase(`${firebaseUrl}/wolframs`);

exports.get = async function(query: string): Promise<string> {
  debug('get wolfram', query);
  let ref = wolframsRef.child(query);
  let res = await readWolframFromCache(ref);
  if (!res) {
    res = await cacheWolfram(query, ref);
  }

  return wolfram.findSolution(res);
};

async function cacheWolfram(query: string, ref: Object): Promise<string> {
  debug('copy query to cache', query);
  let result = await wolfram.executeQuery(query);
  await request(ref, 'set', result);
  return result;
}

function readWolframFromCache(ref: Object): Promise<string> {
  return request(ref, 'once', 'value');
}
