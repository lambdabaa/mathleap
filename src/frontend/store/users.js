/* @flow */

let Firebase = require('firebase/lib/firebase-web');
let debug = require('../../common/debug')('store/users');
let {firebaseUrl} = require('../constants');
let request = require('./request');
let session = require('../session');
let subscribe = require('./subscribe');

import type {FBStudent, FBTeacher} from '../../common/types';

type Credentials = {email: string, password: string};

let baseRef = new Firebase(firebaseUrl);
let studentsRef = baseRef.child('students');
let teachersRef = baseRef.child('teachers');

let subscription;

exports.create = async function(credentials: Credentials): Promise<string> {
  let user = await request(baseRef, 'createUser', credentials);
  debug('create user ok', JSON.stringify(user));
  return user.uid;
};

exports.login = async function(credentials: Credentials): Promise<void> {
  let auth = await request(baseRef, 'authWithPassword', credentials);
  debug('login ok', JSON.stringify(auth));
  session.set('auth', auth);

  let id = auth.uid;
  let ref = isStudent(credentials) ? studentsRef : teachersRef;
  let userRef = ref.child(id);
  subscription = subscribe(userRef, 'value');
  subscription.on('val', (user: FBTeacher | FBStudent): void => {
    user.id = id;
    session.set('user', user);
  });
};

exports.logout = function(): void {
  if (subscription) {
    subscription.cancel();
  }

  session.clear();
};

function isStudent(credentials: Credentials): boolean {
  let {email} = credentials;
  return email.endsWith('@mathleap.org');
}
