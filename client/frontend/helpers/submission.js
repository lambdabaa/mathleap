/* @flow */

let bridge = require('../bridge');

import {
  AssignmentQuestion,
  FBAssignment,
  FBResponse,
  FBQuestionStep,
  FBStudent
} from '../../common/types';

exports.getHeaderText = async function(student: FBStudent, assignment: FBAssignment,
                                       responses: Array<FBResponse>): Promise<string> {
  let grade = await exports.getSubmissionGrade(responses);
  return [
    student && `${student.first} ${student.last}`,
    assignment.name,
    grade
  ]
  .filter((x: ?string) => typeof x === 'string')
  .join(', ');
};

exports.isCorrect = function(question: AssignmentQuestion, answer: string,
                             work: Array<FBQuestionStep>): Promise<boolean> {
  let errorLine = exports.getErrorLine({question, work});
  if (errorLine !== -1) {
    return Promise.resolve(false);
  }

  return bridge('isCorrect', question, answer);
};

// TODO(gaye): This should be quite a bit simpler. Why in some cases do we see
//     error => true then error => false then error => true?
exports.getErrorLine = function(res: FBResponse): number {
  let {work} = res;
  for (let i = 1; i in work; i++) {
    let prev = work[i - 1].error;
    let step = work[i].error;
    if (typeof step === 'boolean' &&
        step &&
        step !== prev) {
      return i;
    }
  }

  return -1;
};

exports.getSubmissionGrade = async function(responses: Array<FBResponse>): Promise<string> {
  let correct = 0;
  for (let i = 0; i < responses.length; i++) {
    let {question, work} = responses[i];
    let answer = work[work.length - 1].state[0];
    let isCorrect = await exports.isCorrect(question, answer, work);
    if (isCorrect) {
      correct++;
    }
  }

  return `${correct} / ${responses.length}`;
};