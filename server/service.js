/* @flow */

let express = require('express');

let server;

function start(port: number): void {
  let app = express();
  app
    .get('/equal', require('./equal'))
    .listen(port);

  process.on('SIGTERM', (): void => process.exit());
}

exports.start = start;
