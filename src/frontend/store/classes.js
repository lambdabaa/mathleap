/* @flow */

let colors = require('../colors');
let createCode = require('../code').create;
let createSafeFirebaseRef = require('../createSafeFirebaseRef');
let debug = require('../../common/debug')('store/classes');
let findKey = require('lodash/object/findKey');
let request = require('./request');
let session = require('../session');
let values = require('lodash/object/values');

import type {FBClass} from '../../common/types';

let classesRef = createSafeFirebaseRef('classes');
let studentsRef = createSafeFirebaseRef('students');
let teachersRef = createSafeFirebaseRef('teachers');

exports.create = async function create(): Promise<void> {
  debug('request add class');
  let teacher = session.get('user').id;
  let code = createCode();
  let color = colors.random();

  let teacherClassRef = teachersRef
    .child(teacher)
    .child('classes')
    .child(code);
  let classRef = classesRef.child(code);

  await Promise.all([
    request(teacherClassRef, 'set', code),
    request(classRef, 'set', {
      name: 'Untitled Class',
      teacher: teacher,
      color,
      code
    })
  ]);

  debug('add class ok');
};

exports.join = async function join(code: string): Promise {
  let student = session.get('user').id;
  let {teacher} = await exports.get(code);

  let studentClassRef = studentsRef
    .child(student)
    .child('classes')
    .child(code);
  let classStudentRef = classesRef
    .child(code)
    .child('students')
    .child(student);
  let studentTeacherRef = studentsRef
    .child(student)
    .child('teachers')
    .child(teacher);

  await Promise.all([
    request(studentClassRef, 'set', code),
    request(classStudentRef, 'set', student),
    request(studentTeacherRef, 'set', teacher)
  ]);
};

/**
 * Options:
 *
 *   (Array) include
 *   (string) key
 */
exports.get = async function get(id: string, options: Object = {}): Promise {
  debug('classes get', id, JSON.stringify(options));
  let ref = typeof options.key !== 'string' ?
    classesRef.child(id) :
    classesRef.orderByChild(options.key).equalTo(id);
  let aClass = await request(ref, 'once', 'value');
  if (!aClass) {
    return null;
  }

  aClass.id = id;
  debug(`Will hydrate class ${id} with ${JSON.stringify(options.include)}.`);
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
  let classTeacherRef = ref.child('teacher');
  let classStudentsRef = ref.child('students');
  let [teacher, students] = await Promise.all([
    request(classTeacherRef, 'once', 'value'),
    request(classStudentsRef, 'once', 'value')
  ]);

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

  let teacherClassRef = teachersRef
    .child(teacher)
    .child('classes')
    .child(id);

  await Promise.all([
    request(ref, 'remove'),
    request(teacherClassRef, 'remove')
  ]);

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

function hydrateClass(aClass: FBClass, include: Array<string> = []): Promise {
  return Promise.all(
    include.map(async function(field) {
      switch (field) {
        case 'teacher':
          aClass.teacher = await request(teachersRef.child(aClass.teacher), 'once', 'value');
          break;
        default:
          throw new Error(`Unknown include key ${field}`);
      }
    })
  );
}
