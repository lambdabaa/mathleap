/* @flow */

let createSafeFirebaseRef = require('../createSafeFirebaseRef');
let debug = require('../../common/debug')('store/assignments');
let {isEqual} = require('./wolframs');
let map = require('lodash/collection/map');
let request = require('./request');
let session = require('../session');
let stringify = require('../../common/stringify');

import type {
  FBResponse,
  FBSubmission,
  FBQuestionStep
} from '../../common/types';

let classesRef = createSafeFirebaseRef('classes');
let studentsRef = createSafeFirebaseRef('students');

exports.create = async function(details: Object): Promise<string> {
  debug('create submission', stringify(details));
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
  debug('get submission', stringify(arguments));
  let submissionRef = getSubmissionRef(classId, assignmentId, submissionId);
  let result = await request(submissionRef, 'once', 'value');
  result.id = submissionId;
  debug('get submission ok', stringify(result));
  return result;
};

exports.list = async function(classId: string,
                              assignmentId: string): Promise<Object> {
  debug('list submissions', stringify(arguments));
  let ref = getSubmissionsRef(classId, assignmentId);
  let result = await request(ref, 'once', 'value');
  debug('list submissions ok', stringify(result));
  return result;
};

exports.commitDelta = async function(classId: string, assignmentId: string,
                                     submissionId: string, question: number,
                                     work: Array<Object>, changes: Array<Array<Array<number | string>>>,
                                     appends: Array<string>, state: Array<string>): Promise<void> {
  debug('commit delta', stringify(arguments));
  let ref = getSubmissionRef(classId, assignmentId, submissionId);
  let curr = ref.child(`/responses/${question}/work/${work.length - 1}`);
  let next = ref.child(`/responses/${question}/work/${work.length}`);

  let operation;
  if (changes[0].length > 1) {
    operation = 'rewrite';
  } else if (appends[0].length) {
    operation = 'both-sides';
  } else {
    throw new Error('No changes made');
  }

  // TODO(gaye): Use atomic update.
  await Promise.all([
    request(curr.child('appends'), 'set', appends),
    request(curr.child('changes'), 'set', changes),
    request(next, 'set', {operation, state})
  ]);

  debug('commit delta ok');
};

exports.commitAnswer = async function(classId: string, assignmentId: string,
                                      submissionId: string, question: number,
                                      work: Array<Object>, state: Array<string>): Promise<void> {
  debug('commit answer', stringify(arguments));
  let ref = getSubmissionRef(classId, assignmentId, submissionId);
  let next = ref.child(`/responses/${question}/work/1`);
  await request(next, 'set', {operation: 'answer', state});
  debug('commit answer ok');
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
          let eql;
          try {
            eql = await isEqual(
              step.state[0].replace('=', '=='),
              question.solution.toString().replace('=', '=='),
              question.instruction
            );
          } catch (error) {
            eql = false;
          }

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
