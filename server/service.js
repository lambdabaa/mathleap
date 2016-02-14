/* @flow */

let express = require('express');
let https = require('https');

function start(port: number): void {
  let app = express();
  app.get('/equal', require('./equal'));
  // $FlowFixMe: Flow doesn't think https.createServer exists?
  let server = https.createServer(app);
  server.listen(port);
  process.on('SIGTERM', (): void => {
    server.close();
    process.exit();
  });
}

exports.start = start;
