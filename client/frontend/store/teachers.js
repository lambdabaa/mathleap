/* @flow */

let createSafeFirebaseRef = require('../createSafeFirebaseRef');
let debug = require('../../common/debug')('store/teachers');
let request = require('./request');
let users = require('./users');

import type {FBTeacher} from '../../common/types';

let teachersRef = createSafeFirebaseRef('teachers');

exports.create = async function(options: Object, uid: string): Promise<void> {
  let teacher = {
    email: options.email,
    title: options.title || 'Prof',
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

exports.get = async function(id: string): Promise<?FBTeacher> {
  debug('get teacher', id);
  let ref = teachersRef.child(id);
  let teacher = await request(ref, 'once', 'value');
  if (!teacher) {
    return null;
  }

  teacher.id = id;
  debug('get teacher ok', JSON.stringify(teacher));
  return teacher;
};
