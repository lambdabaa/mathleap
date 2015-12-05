/**
 * @fileoverview Proxy api requests from frontend to backend.
 */

let ProxyWorker = require('proxyworker/lib/proxyworker');

let worker;

async function connect() {
  if (worker) {
    return worker;
  }

  worker = new ProxyWorker(new Worker('backend.min.js'));
  await worker.callWithArgs('ping');
  return worker;
}

module.exports = async function(method, ...args) {
  let aWorker = await connect();
  let result = await aWorker.callWithArgs(method, args);
  return result;
};
