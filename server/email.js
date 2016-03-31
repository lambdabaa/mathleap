/* @flow */

let express = require('express');
let ses = require('node-ses');

const key = 'AKIAJPTT2NCVASJLQESQ';
const secret = '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';
let client = ses.createClient({
  key,
  secret,
  amazon: 'https://email.us-west-2.amazonaws.com'
});

function email(req: express.request, res: express.response) {
  let {to, subject, html, text} = req.body;
  client.sendEmail(
    {
      from: 'hello@mathleap.org',
      subject,
      message: html,
      altText: text,
      to
    },
    err => res.sendStatus(err ? 500 : 200)
  );
}

module.exports = email;
