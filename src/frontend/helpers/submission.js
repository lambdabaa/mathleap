/* @flow */

let findKey = require('lodash/object/findKey');

import {
  AssignmentQuestion,
  FBResponse,
  FBQuestionStep
} from '../../common/types';

exports.isCorrect = function(question: AssignmentQuestion, answer: string): boolean {
  let [left, right] = answer.split('=');
  let solution = question.solution.toString();
  return left === solution || right === solution;
};

exports.getErrorLine = function(res: FBResponse): number {
  return +findKey(res.work, (step: FBQuestionStep): boolean => !!step.error);
};
