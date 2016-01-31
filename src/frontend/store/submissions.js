/* @flow */

let Firebase = require('firebase/lib/firebase-web');
let debug = require('../../common/debug')('store/assignments');
let {firebaseUrl} = require('../constants');
let includes = require('lodash/collection/includes');
let {isEqual} = require('./wolframs');
let map = require('lodash/collection/map');
let request = require('./request');
let session = require('../session');

import type {
  FBResponse,
  FBSubmission,
  FBQuestionStep
} from '../../common/types';

let classesRef = new Firebase(`${firebaseUrl}/classes`);
let studentsRef = new Firebase(`${firebaseUrl}/students`);

exports.create = async function(details: Object): Promise<string> {
  debug('create submission', JSON.stringify(details));
  let {classId, assignmentId, studentId} = details;
  let ref = classesRef.child(
    `${classId}/assignments/${assignmentId}/submissions/${studentId}`
  );

  await request(ref, 'set', details);
  debug('create submission ok');
  return ref.key();
};

exports.get = async function(classId: string, assignmentId: string,
                             submissionId: string): Promise<FBSubmission> {
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
  let submissionRef = getSubmissionRef(classId, assignmentId, submissionId);

  // First check all of the problems.
  let {responses} = await exports.get(classId, assignmentId, submissionId);
  await Promise.all(
    map(responses, async function (response: FBResponse, i: string): Promise {
      let {question, work} = response;
      debug(`Grading response to ${question.question}`);
      if (work.length < 2) {
        return;
      }

      await Promise.all(
        map(work, async function(step: FBQuestionStep, j: string): Promise {
          let eql = await isEqual(
            step.state[0].replace('=', '=='),
            question.solution.toString().replace('=', '==')
          );

          debug(`Checking step ${j} ${step.state[0]}... `, eql ? '✔' : '✗');
          let errorRef = submissionRef.child(`/responses/${i}/work/${j}/error`);
          await request(errorRef, 'set', !eql);
        })
      );
    })
  );

  // Then mark the submission complete.
  await request(submissionRef.child('complete'), 'set', true);

  debug('submission submit ok');
};

function getSubmissionsRef(classId: string, assignmentId: string): Object {
  return classesRef.child(`${classId}/assignments/${assignmentId}/submissions`);
}

function getSubmissionRef(classId: string, assignmentId: string,
                          submissionId: string): Object {
  if (!classId) {
    debug('practice mode');
    let user = session.get('user');
    return studentsRef.child(`${user.id}/assignments/${assignmentId}/submission`);
  }

  return getSubmissionsRef(classId, assignmentId).child(submissionId);
}
