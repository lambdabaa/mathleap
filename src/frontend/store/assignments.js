let Firebase = require('firebase/lib/firebase-web');
let debug = console.log.bind(console, '[store/assignments]');
let {firebaseUrl} = require('../constants');
let request = require('./request');

let classesRef = new Firebase(`${firebaseUrl}/classes`);

exports.create = async function create(aClass, details) {
  debug('create assignment', JSON.stringify(aClass), JSON.stringify(details));
  let classId = aClass.id;
  let classRef = classesRef.child(classId);
  let assignmentsRef = classRef.child('assignments');
  let ref = assignmentsRef.push();
  await request(ref, 'set', details);
  debug('create assignment ok');
};

exports.get = async function get(classId, assignmentId) {
  debug('get assignment', classId, assignmentId);
  let assignmentRef = classesRef.child(
    `${classId}/assignments/${assignmentId}`
  );

  let result = await request(assignmentRef, 'once', 'value');
  result.id = assignmentId;
  debug('get assignment ok', JSON.stringify(result));
  return result;
};
