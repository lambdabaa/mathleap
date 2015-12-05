let Firebase = require('firebase/lib/firebase-web');
let debug = console.log.bind(console, '[store/wolframs]');
let {firebaseUrl} = require('../constants');
let request = require('./request');
let wolfram = require('../wolfram');

let wolframsRef = new Firebase(`${firebaseUrl}/wolframs`);

exports.get = async function(query) {
  debug('get wolfram', query);
  let ref = wolframsRef.child(query);
  let res = await readWolframFromCache(ref);
  if (!res) {
    res = await cacheWolfram(query, ref);
  }

  return wolfram.findSolution(res);
};

async function cacheWolfram(query, ref) {
  debug('copy query to cache', query);
  let result = await wolfram.executeQuery(query);
  await request(ref, 'set', result);
  return result;
}

async function readWolframFromCache(ref) {
  let result;
  try {
    result = await request(ref, 'once', 'value');
  } catch (error) {
    debug('error reading wolfram cache', error.toString());
  }

  return result;
}
