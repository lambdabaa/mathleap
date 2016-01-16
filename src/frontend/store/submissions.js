/* @flow */

let Firebase = require('firebase/lib/firebase-web');
let debug = console.log.bind(console, '[store/assignments]');
let {firebaseUrl} = require('../constants');
let includes = require('lodash/collection/includes');
let request = require('./request');

let classesRef = new Firebase(`${firebaseUrl}/classes`);

exports.create = async function(details: Object): Promise<string> {
  debug('create submission', JSON.stringify(details));
  let {classId, assignmentId} = details;
  let submissionsRef = classesRef.child(
    `${classId}/assignments/${assignmentId}/submissions`
  );

  let submissionRef = submissionsRef.push();
  await request(submissionRef, 'set', details);
  debug('create submission ok');
  return submissionRef.key();
};

exports.get = async function(classId: string, assignmentId: string,
                             submissionId: string): Promise<Object> {
  debug('get submission', JSON.stringify(arguments));
  let submissionRef = getSubmissionRef(classId, assignmentId, submissionId);
  let result = await request(submissionRef, 'once', 'value');
  result.id = submissionId;
  debug('get submission ok', JSON.stringify(result));
  return result;
};

exports.list = async function(classId: string,
                              assignmentId: string): Promise<Object> {
  debug('list submissions', JSON.stringify(arguments));
  let ref = getSubmissionsRef(classId, assignmentId);
  let result = await request(ref, 'once', 'value');
  debug('list submissions ok', JSON.stringify(result));
  return result;
};

exports.commitDelta = async function(classId: string, assignmentId: string,
                                     submissionId: string, question: number,
                                     work: Array<Object>, changes: Array<Array<string>>,
                                     appends: Array<string>, state: Array<string>): Promise<void> {
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

  debug('commit delta ok');
};

exports.popDelta = async function(classId: string, assignmentId: string,
                                  submissionId: string, question: string,
                                  work: Array<Object>): Promise<void> {
  if (work.length < 2) {
    return debug('No deltas to pop!');
  }

  let ref = getSubmissionRef(classId, assignmentId, submissionId);
  let curr = ref.child(`/responses/${question}/work/${work.length - 1}`);
  let prev = ref.child(`/responses/${question}/work/${work.length - 2}`);
  await Promise.all([
    request(prev.child('appends'), 'remove'),
    request(prev.child('changes'), 'remove'),
    request(curr, 'remove')
  ]);

  debug('pop delta ok');
};

exports.submit = async function(classId: string, assignmentId: string,
                                submissionId: string): Promise<void> {
  let ref = getSubmissionRef(classId, assignmentId, submissionId);
  await request(ref.child('complete'), 'set', true);
  debug('submission submit ok');
};

function getSubmissionsRef(classId: string, assignmentId: string): Object {
  return classesRef.child(`${classId}/assignments/${assignmentId}/submissions`);
}

function getSubmissionRef(classId: string, assignmentId: string,
                          submissionId: string): Object {
  return getSubmissionsRef(classId, assignmentId).child(submissionId);
}
