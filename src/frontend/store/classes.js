let Firebase = require('firebase/lib/firebase-web');
let colors = require('../colors');
let createCode = require('../code').create;
let debug = console.log.bind(console, '[store/classes]');
let request = require('./request');
let session = require('../session');

let classesRef = new Firebase('https://mathleap.firebaseio.com/classes');
let studentsRef = new Firebase('https://mathleap.firebaseio.com/students');
let teachersRef = new Firebase('https://mathleap.firebaseio.com/teachers');

exports.create = async function create() {
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

exports.join = async function join(code) {
  let student = session.get('user');
  let studentId = btoa(student.email);

  let aClass = await exports.get(code, {key: 'code'});
  let id = Object.keys(aClass)[0];

  let classRef = classesRef.child(id);
  let classStudentsRef = classRef.child('students');
  let classStudentRef = classStudentsRef.push();

  let studentClassesRef = studentsRef
    .child(studentId)
    .child('classes');
  let studentClassRef = studentClassesRef.push();

  // TODO(gaye): We should make this a single request so we don't
  //     get in a bad state if one but not both requests succeeds.
  await Promise.all([
    request(studentClassRef, 'set', id),          // add to student/:id/classes
    request(classStudentRef, 'set', studentId)    // add to class/:id/students
  ]);
};

/**
 * Options:
 *
 *   (Array) include
 *   (string) key
 */
exports.get = async function get(id, options = {}) {
  debug('classes get', id, JSON.stringify(options));
  let ref;
  if (typeof options.key !== 'string') {
    ref = classesRef.child(id);
  } else {
    ref = classesRef
      .orderByChild(options.key)
      .equalTo(id);
  }

  let aClass = await request(ref, 'once', 'value');
  if (!aClass) {
    return null;
  }

  aClass.id = id;

  // Hydrate extra fields hanging off of the class.
  if (Array.isArray(options.include)) {
    let include = options.include;
    for (let i = 0; i < include.length; i++) {
      let field = include[i];
      switch (field) {
        case 'teacher':
          let teacherRef = teachersRef
            .orderByChild('uid')
            .equalTo(aClass.teacher);
          let teachers = await request(teacherRef, 'once', 'value');
          aClass.teacher = teachers[Object.keys(teachers)[0]];
          break;
        default:
          throw new Error(`Unknown include key ${field}`);
      }
    }
  }

  return aClass;
};

exports.update = async function update(id, details) {
  debug('update class', id, details);
  let ref = classesRef.child(id);
  await request(ref, 'update', details);
  debug('update class ok');
};

exports.remove = async function remove(id) {
  debug('request delete class', id);
  let ref = classesRef.child(id);
  await request(ref, 'remove');
  debug('delete class ok');
};

exports.createAssignment = async function createAssignment(aClass, details) {
  let classId = aClass.id;
  let classRef = classesRef.child(classId);
  let assignmentsRef = classRef.child('assignments');
  let ref = assignmentsRef.push();
  await request(ref, 'set', details);
};
