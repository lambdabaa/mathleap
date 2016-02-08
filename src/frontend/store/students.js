/* @flow */

let Firebase = require('firebase/lib/firebase-web');
let debug = require('../../common/debug')('store/students');
let {firebaseUrl} = require('../constants');
let request = require('./request');
let session = require('../session');
let users = require('./users');

import type {FBStudent} from '../../common/types';

let studentsRef = new Firebase(`${firebaseUrl}/students`);

exports.create = async function(options: Object, uid: string): Promise<void> {
  let student = {
    email: options.email,
    first: options.first,
    last: options.last,
    username: options.username,
    role: 'student',
    misc: options.misc || {}
  };

  if (uid == null) {
    uid = await users.create({email: options.email, password: options.password});
  }

  let ref = studentsRef.child(uid);
  await request(ref, 'set', student);
  debug('create student ok', JSON.stringify(student));
};

exports.get = async function get(id: string): Promise<?FBStudent> {
  debug('get student', id);
  let ref = studentsRef.child(id);
  let student = await request(ref, 'once', 'value');
  if (!student) {
    return null;
  }

  student.id = id;
  debug('get student ok', JSON.stringify(student));
  return student;
};

exports.createPractice = async function(details: Object): Promise<string> {
  let {id} = session.get('user');
  let studentRef = studentsRef.child(id);
  let assignmentsRef = studentRef.child('assignments');
  let ref = assignmentsRef.push();
  await request(ref, 'set', details);
  let refparts = ref.toString().split('/');
  return refparts[refparts.length - 1];
};
