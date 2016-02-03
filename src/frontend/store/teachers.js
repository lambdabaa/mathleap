/* @flow */

let Firebase = require('firebase/lib/firebase-web');
let debug = require('../../common/debug')('store/teachers');
let {firebaseUrl} = require('../constants');
let request = require('./request');
let users = require('./users');

import type {FBTeacher} from '../../common/types';

let teachersRef = new Firebase(`${firebaseUrl}/teachers`);

exports.create = async function(options: Object, uid: number|string): Promise<void> {
  let teacher = {
    email: options.email,
    title: options.title,
    first: options.first,
    last: options.last,
    role: 'teacher',
    misc: options.misc || {}
  };

  if (uid == null) {
    uid = await users.create({email: options.email, password: options.password});
  }

  let ref = teachersRef.child(uid);
  await request(ref, 'set', teacher);
  debug('create teacher ok', JSON.stringify(teacher));
};

exports.get = async function(id: string): Promise<FBTeacher> {
  debug('get teacher', id);
  let ref = teachersRef.child(id);
  let teacher = await request(ref, 'once', 'value');
  teacher.id = id;
  debug('get teacher ok', JSON.stringify(teacher));
  return teacher;
};
