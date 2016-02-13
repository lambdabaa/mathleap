/* @flow */
/**
 * @fileoverview Proxy api requests from frontend to backend.
 */

let ProxyWorker = require('proxyworker/lib/proxyworker');

let worker;

async function connect(): Promise<ProxyWorker> {
  if (worker) {
    return worker;
  }

  worker = new ProxyWorker(new Worker('public/backend.min.js'));
  await worker.callWithArgs('ping');
  return worker;
}

module.exports = async function(method: string, ...args: any): Promise {
  let aWorker = await connect();
  let result = await aWorker.callWithArgs(method, args);
  return result;
};
