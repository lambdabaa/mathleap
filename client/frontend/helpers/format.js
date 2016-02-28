/* @flow */

let stmt = require('../../common/stmt');

import type {
  AssignmentQuestion,
  FBStudent,
  FBTeacher
} from '../../common/types';

exports.student = function(student: FBStudent): string {
  let {first, last, username} = student;
  let parts = [];

  if (first && first.length) {
    parts.push(first);
  }

  if (last && last.length) {
    parts.push(last);
  }

  if (username && username.length) {
    parts.push(`(${username})`);
  }

  return parts.join(' ');
};

exports.studentName = function(student: ?FBStudent): ?string {
  if (!student) {
    return null;
  }

  let {first, last} = student;
  let parts = [];

  if (first && first.length) {
    parts.push(first);
  }

  if (last && last.length) {
    parts.push(last);
  }

  return parts.join(' ');
};

exports.teacher = function(teacher: FBTeacher): string {
  let {title, last} = teacher;
  let parts = [];

  if (title && title.length) {
    parts.push(title);
  }

  if (last && last.length) {
    parts.push(last);
  }

  return parts.join(' ');
};

exports.solution = function(question: AssignmentQuestion): string {
  let solution = '' + question.solution;
  let variable;
  if (question.instruction && /^Solve for ([a-z])\.$/.test(question.instruction)) {
    // $FlowFixMe
    variable = RegExp.$1;
  } else {
    return solution;
  }

  let type = stmt.getStmtType(solution);
  return type === 'expression' ? `${variable}=${solution}` : solution;
};
