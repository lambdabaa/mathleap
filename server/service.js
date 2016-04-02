/* @flow */

let bodyParser = require('body-parser');
let express = require('express');
let http = require('http');

function start(port: number): void {
  let app = express();
  app.use(bodyParser.json());
  app.use(require('./cors'));
  app.post('/email', require('./email'));
  app.get('/equal', require('./equal'));
  let server = http.createServer(app);
  server.listen(port);
  process.on('SIGTERM', (): void => {
    server.close();
    process.exit();
  });
}

exports.start = start;
