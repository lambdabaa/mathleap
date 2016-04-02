/* @flow */

let Xhr = require('./xhr');
let {apiUrl} = require('./constants');

function sendEmail(to: string, subject: string, html: string,
                   text: string): Promise {
  let url = `${apiUrl}/email/`;
  let req = new Xhr();
  let body = JSON.stringify({to, subject, html, text});
  req.open('POST', url, true /* async */);
  req.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
  return req.send(body);
}

exports.sendEmail = sendEmail;
