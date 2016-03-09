/* @flow */

let bridge = require('../bridge');
let format = require('./format');

import {
  AssignmentQuestion,
  FBAssignment,
  FBResponse,
  FBQuestionStep,
  FBStudent,
  FBSubmission
} from '../../common/types';

exports.getHeaderText = async function(student: FBStudent, assignment: FBAssignment,
                                       responses: Array<FBResponse>): Promise<string> {
  let grade = await exports.getSubmissionGrade(responses);
  return [
    format.studentName(student),
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

exports.computeQuestionToCorrect = async function(submissions: Array<FBSubmission>): Object {
  let result = {};
  await Promise.all(
    submissions.map((submission: FBSubmission): Promise => {
      return Promise.all(
        submission.responses.map(async (response: FBResponse, index: number): Promise => {
          if (!(index in result)) {
            result[index] = 0;
          }

          let {question, work} = response;
          let answer = work[work.length - 1].state[0];
          let isCorrect = await exports.isCorrect(question, answer, work);
          if (isCorrect) {
            result[index] += 1;
          }
        })
      );
    })
  );

  for (let question in result) {
    result[question] /= submissions.length;
  }

  return result;
};
