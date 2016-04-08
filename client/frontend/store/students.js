/* @flow */

let createSafeFirebaseRef = require('../createSafeFirebaseRef');
let debug = require('../../common/debug')('store/students');
let request = require('./request');
let session = require('../session');
let stringify = require('../../common/stringify');
let users = require('./users');

import type {FBStudent} from '../../common/types';

let studentsRef = createSafeFirebaseRef('students');

exports.create = async function(options: Object, uid: ?string): Promise<void> {
  let student = {
    email: options.email ||
           (options.username ?
              `${options.username}@mathleap.org` :
              'unknown-student@mathleap.org'),
    first: options.first || '',
    last: options.last || '',
    username: options.username || 'student',
    role: 'student',
    misc: options.misc || {},
    scratchpadFtu: true
  };

  if (uid == null) {
    uid = await users.create({email: options.email, password: options.password});
  }

  let ref = studentsRef.child(uid);
  await request(ref, 'set', student);
  debug('create student ok', stringify(student));
};

exports.get = async function get(id: string): Promise<?FBStudent> {
  debug('get student', id);
  let ref = studentsRef.child(id);
  let student = await request(ref, 'once', 'value');
  if (!student) {
    return null;
  }

  student.id = id;
  debug('get student ok', stringify(student));
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

exports.clearScratchpadFtu = async function(student: FBStudent): Promise {
  let ref = studentsRef.child(student.id);
  let ftu = ref.child('scratchpadFtu');
  await request(ftu, 'set', false);
  // TODO: This is not ideal...
  let user = await exports.get(student.id);
  session.set('user', user);
};
