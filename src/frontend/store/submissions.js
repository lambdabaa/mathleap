let Firebase = require('firebase/lib/firebase-web');
let debug = console.log.bind(console, '[store/assignments]');
let includes = require('lodash/collection/includes');
let request = require('./request');

let classesRef = new Firebase('https://mathleap.firebaseio.com/classes');

exports.create = async function(details) {
  debug('create submission', JSON.stringify(details));
  let {classId, assignmentId} = details;
  let submissionsRef = classesRef.child(`${classId}/assignments/${assignmentId}/submissions`);
  let submissionRef = submissionsRef.push();
  await request(submissionRef, 'set', details);
  debug('create submission ok');
  return submissionRef.key();
};

exports.get = async function(classId, assignmentId, submissionId) {
  debug('get submission', JSON.stringify(arguments));
  let submissionRef = getSubmissionRef(classId, assignmentId, submissionId);
  let result = await request(submissionRef, 'once', 'value');
  debug('get submission ok', JSON.stringify(result));
  return result;
};

exports.commitDelta = async function(classId, assignmentId, submissionId, question, work, changes, appends, state) {
  debug('commit delta', JSON.stringify(arguments));

  let ref = getSubmissionRef(classId, assignmentId, submissionId);
  let curr = ref.child(`/responses/${question}/work/${work.length - 1}`);
  let next = ref.child(`/responses/${question}/work/${work.length}`);

  let operation;
  if (includes(changes[0], 'highlight')) {
    operation = 'replace';
  } else if (includes(changes[0], 'strikethrough')) {
    operation = 'cancel';
  } else if (appends[0].length) {
    operation = 'both-sides';
  } else {
    // TODO(gaye): Handle add equation.
    operation = 'noop';
  }

  // TODO(gaye): Use atomic update.
  await Promise.all([
    request(curr.child('appends'), 'set', appends),
    request(curr.child('changes'), 'set', changes),
    request(next, 'set', {operation, state})
  ]);
};

function getSubmissionRef(classId, assignmentId, submissionId) {
  return classesRef.child(`${classId}/assignments/${assignmentId}/submissions/${submissionId}`);
}
