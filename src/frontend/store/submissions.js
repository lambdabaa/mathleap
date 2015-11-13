let Firebase = require('firebase/lib/firebase-web');
let debug = console.log.bind(console, '[store/assignments]');
let request = require('./request');

let classesRef = new Firebase('https://mathleap.firebaseio.com/classes');

exports.create = async function create(details) {
  debug('create submission', JSON.stringify(details));
  let {classId, assignmentId} = details;
  let submissionsRef = classesRef.child(`${classId}/assignments/${assignmentId}/submissions`);
  let submissionRef = submissionsRef.push();
  await request(submissionRef, 'set', details);
  debug('create submission ok');
  return submissionRef.key();
};

exports.get = async function get(classId, assignmentId, submissionId) {
  debug('get submission', classId, assignmentId, submissionId);
  let submissionRef = classesRef.child(`${classId}/assignments/${assignmentId}/submissions/${submissionId}`);
  let result = await request(submissionRef, 'once', 'value');
  debug('get submission ok', JSON.stringify(result));
  return result;
};
