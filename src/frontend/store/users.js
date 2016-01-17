/* @flow */

let Firebase = require('firebase/lib/firebase-web');
let debug = require('../../common/debug')('store/users');
let {firebaseUrl} = require('../constants');
let request = require('./request');
let session = require('../session');
let subscribe = require('./subscribe');

let baseRef = new Firebase(firebaseUrl);
let studentsRef = baseRef.child('students');
let teachersRef = baseRef.child('teachers');

let subscription;

exports.create = async function(credentials: Object): Promise<string> {
  let user = await request(baseRef, 'createUser', credentials);
  debug('create user ok', JSON.stringify(user));
  return user.uid;
};

exports.login = async function(credentials: Object): Promise<void> {
  let auth = await request(baseRef, 'authWithPassword', credentials);
  debug('login ok', JSON.stringify(auth));
  let key = btoa(credentials.email);
  let userRef = credentials.email.endsWith('@mathleap.org') ?
    studentsRef.child(key) :
    teachersRef.child(key);

  session.set('auth', auth);
  subscription = subscribe(userRef, 'value');
  subscription.on('val', user => session.set('user', user));
};

exports.logout = function(): void {
  if (subscription) {
    subscription.cancel();
  }

  session.clear();
};
