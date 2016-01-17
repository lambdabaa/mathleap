/* @flow */

let Firebase = require('firebase/lib/firebase-web');
let debug = require('../../common/debug')('store/teachers');
let {firebaseUrl} = require('../constants');
let request = require('./request');
let users = require('./users');

let teachersRef = new Firebase(`${firebaseUrl}/teachers`);

exports.create = async function(options: Object): Promise<void> {
  let uid = await users.create({email: options.email, password: options.password});

  let teacher = {
    email: options.email,
    title: options.title,
    first: options.first,
    last: options.last,
    role: 'teacher',
    uid
  };

  let ref = teachersRef.child(btoa(teacher.email));
  await request(ref, 'set', teacher);
  debug('create teacher ok', JSON.stringify(teacher));
};
