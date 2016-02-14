/* @flow */

let debug = console.log.bind(console, '[equal]');
let express = require('express');
let http = require('http');
let https = require('https');
let querystring = require('querystring');

const wolframCloud = 'https://www.wolframcloud.com';
const user = 'user-98809d9a-795a-441e-94c3-7cfc16e68c99';

function equal(req: express.request,
               res: express.response): void {
  let {check, a, b, vars} = req.query;
  let url = `${wolframCloud}/objects/${user}/check${check}Equivalence`;
  let urlparams = querystring.stringify({a, b, vars});
  url += `?${urlparams}`;
  stream(url, res);
}

function stream(url, out: express.response): void {
  function handleError(error: Error): void {
    debug(error.toString());
    out.sendStatus(500);
  }

  // $FlowFixMe: Flow doesn't think https.get exists?
  let req = https.get(url, (res: http.IncomingMessage): void => {
    req.removeListener('error', handleError);

    if (res.statusCode < 200 || res.statusCode > 299) {
      debug(url, 'status code', res.statusCode);
      return out.sendStatus(500);
    }

    res.pipe(out);
  });

  req.on('error', handleError);
}

module.exports = equal;
