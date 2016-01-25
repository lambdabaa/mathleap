/* @flow */

import {
  AssignmentQuestion,
  FBAssignment,
  FBResponse,
  FBStudent
} from '../../common/types';

exports.getHeaderText = function(user: FBStudent, assignment: FBAssignment,
                                responses: Array<FBResponse>): string {
  return [
    `${user.first} ${user.last}`,
    assignment.name,
    exports.getSubmissionGrade(responses)
  ]
  .filter((x: ?string) => typeof x === 'string')
  .join(', ');
};

exports.isCorrect = function(question: AssignmentQuestion, answer: string): boolean {
  let [left, right] = answer.split('=');
  let solution = question.solution.toString();
  return left === solution || right === solution;
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

exports.getSubmissionGrade = function(responses: Array<FBResponse>): string {
  let correct = responses
    .filter((response: FBResponse) => {
      let {question, work} = response;
      let answer = work[work.length - 1].state[0];
      return exports.isCorrect(question, answer);
    })
    .length;

  return `${correct} / ${responses.length}`;
};
