/* @flow */

let express = require('express');

function cors(req: express.request, res: express.response, next: Function) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
}

module.exports = cors;
