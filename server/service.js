/* @flow */

let express = require('express');
let http = require('http');

function start(port: number): void {
  let app = express();
  app.use(require('./cors'));
  app.get('/equal', require('./equal'));
  let server = http.createServer(app);
  server.listen(port);
  process.on('SIGTERM', (): void => {
    server.close();
    process.exit();
  });
}

exports.start = start;
