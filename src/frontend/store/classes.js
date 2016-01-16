/* @flow */

let Firebase = require('firebase/lib/firebase-web');
let colors = require('../colors');
let createCode = require('../code').create;
let debug = console.log.bind(console, '[store/classes]');
let findKey = require('lodash/object/findKey');
let {firebaseUrl} = require('../constants');
let request = require('./request');
let session = require('../session');
let values = require('lodash/object/values');

import type {FBClass} from '../../common/types';

let classesRef = new Firebase(`${firebaseUrl}/classes`);
let studentsRef = new Firebase(`${firebaseUrl}/students`);
let teachersRef = new Firebase(`${firebaseUrl}/teachers`);

exports.create = async function create(): Promise<void> {
  debug('request add class');
  let teacher = session.get('user');
  let newClassRef = classesRef.push();
  let color = colors.random();
  let code = createCode();
  await request(newClassRef, 'set', {
    name: 'Untitled Class',
    teacher: teacher.uid,
    color,
    code
  });

  debug('add class ok');
};

exports.join = async function join(code: string): Promise {
  let studentId = getStudentId();
  let aClass = await exports.get(code, {key: 'code'});
  let id = Object.keys(aClass)[0];

  let classStudentRef = classesRef
    .child(id)
    .child('students')
    .push();

  let studentClassRef = studentsRef
    .child(studentId)
    .child('classes')
    .push();

  // TODO(gaye): We should make this a single request so we don't
  //     get in a bad state if one but not both requests succeeds.
  await Promise.all([
    request(classStudentRef, 'set', studentId),   // add to class/:id/students
    request(studentClassRef, 'set', id)           // add to student/:id/classes
  ]);
};

/**
 * Options:
 *
 *   (Array) include
 *   (string) key
 */
exports.get = async function get(id: string, options: Object = {}): Promise<?FBClass> {
  debug('classes get', id, JSON.stringify(options));
  let ref = typeof options.key !== 'string' ?
    classesRef.child(id) :
    classesRef.orderByChild(options.key).equalTo(id);
  let aClass = await request(ref, 'once', 'value');
  if (!aClass) {
    return null;
  }

  aClass.id = id;
  await hydrateClass(aClass, options.include);
  return aClass;
};

exports.update = async function update(id: string, details: Object): Promise<void> {
  debug('update class', id, details);
  let ref = classesRef.child(id);
  await request(ref, 'update', details);
  debug('update class ok');
};

exports.remove = async function remove(id: string): Promise<void> {
  debug('request delete class', id);

  // First find all of the students in the class.
  let ref = classesRef.child(id);
  let classStudentsRef = ref.child('students');
  let students = await request(classStudentsRef, 'once', 'value');
  let studentIds = values(students);
  await Promise.all(
    studentIds.map(async (studentId: string): Promise => {
      let studentClassesRef = studentsRef
        .child(studentId)
        .child('classes');
      let classes = await request(studentClassesRef, 'once', 'value');
      let key = findKey(classes, aClass => aClass === id);
      await request(studentClassesRef.child(key), 'remove');
    })
  );

  await request(ref, 'remove');
  debug('delete class ok');
};

exports.createAssignment = async function createAssignment(aClass: FBClass,
                                                           details: Object): Promise {
  let classId = aClass.id;
  let classRef = classesRef.child(classId);
  let assignmentsRef = classRef.child('assignments');
  let ref = assignmentsRef.push();
  await request(ref, 'set', details);
};

function getStudentId(): string {
  let {email} = session.get('user');
  return btoa(email);
}

function hydrateClass(aClass: FBClass, include: Array<string> = []): Promise {
  return Promise.all(
    include.map(async function(field) {
      switch (field) {
        case 'teacher':
          let ref = teachersRef
            .orderByChild('uid')
            .equalTo(aClass.teacher);
          let teachers = await request(ref, 'once', 'value');
          aClass.teacher = teachers[Object.keys(teachers)[0]];
          break;
        default:
          throw new Error(`Unknown include key ${field}`);
      }
    })
  );
}
