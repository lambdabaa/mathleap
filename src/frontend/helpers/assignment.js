/* @flow */

let classes = require('../store/classes');
let colors = require('../colors');
let debug = require('../../common/debug')('helpers/assignment');
let groupBy = require('lodash/collection/groupBy');
let {isNonNullObject} = require('../../common/object');
let mapValues = require('lodash/object/mapValues');
let moment = require('moment');
let questions = require('../store/questions');
let reduce = require('lodash/collection/reduce');
let round = require('../round');
let session = require('../session');
let stringify = require('json-stringify-safe');
let submissions = require('../store/submissions');
let submissionHelper = require('./submission');
let sum = require('lodash/math/sum');
let values = require('lodash/object/values');

import type {
  QuestionType,
  QuestionTopic,
  Assignment,
  AssignmentSection,
  FBAssignment,
  FBStudent,
  FBSubmission
} from '../../common/types';

exports.createAssignment = function(): Assignment {
  let deadline = moment();
  deadline.date(deadline.date() + 1);
  return {deadline, composition: [], preview: null};
};

exports.getSize = function(assignment: Assignment): number {
  return assignment.composition.reduce((acc, part) => acc + part.count, 0);
};

exports.addTopic = function(assignment: Assignment, topic: QuestionTopic,
                            type: QuestionType): Assignment {
  debug('add topic', stringify(arguments));
  if (countQuestionsByType(assignment, type) >= 10) {
    return assignment;
  }

  let color = colors.random();
  assignment.composition.push({topic, type, color, count: 1});
  assignment.preview = null;
  return assignment;
};

exports.incrementTopicCount = function(assignment: Assignment, index: number): Assignment {
  let section = assignment.composition[index];
  if (countQuestionsByType(assignment, section.type) >= 10) {
    return assignment;
  }

  return changeTopicCount(assignment, index, 1);
};

exports.decrementTopicCount = function(assignment: Assignment, index: number): Assignment {
  return changeTopicCount(assignment, index, -1);
};

exports.incrementDeadline = function(assignment: Assignment): Assignment {
  return changeDeadline(assignment, 1);
};


exports.decrementDeadline = function(assignment: Assignment): Assignment {
  return changeDeadline(assignment, -1);
};

exports.getPreview = async function(assignment: Assignment): Promise<Assignment> {
  debug('preview assignment');
  if (Array.isArray(assignment.preview)) {
    return assignment;
  }

  assignment.preview = await questions.createAssignment(assignment.composition);
  return assignment;
};

exports.assign = async function(aClass: Object, assignments: Array<Object>,
                                assignment: Assignment): Promise<void> {
  debug('create assignment');
  if (!Array.isArray(assignment.preview)) {
    assignment.preview = await questions.createAssignment(assignment.composition);
  }

  await classes.createAssignment(aClass, {
    name: `Assignment ${assignments.length + 1}`,
    deadline: assignment.deadline.format('MM/DD/YY'),
    questions: assignment.preview
  });
};

exports.findOrCreateSubmission = async function(classId: string,
                                                assignment: FBAssignment): Promise<FBSubmission> {
  debug('findOrCreateStudentSubmission', stringify(arguments));
  if (!exports.containsStudentSubmission(assignment)) {
    await exports.createStudentSubmission(classId, assignment);
    assignment.submissions = await submissions.list(classId, assignment['.key']);
  }

  return exports.getStudentSubmission(assignment);
};

/**
 * Create a new, in-progress, empty submission.
 */
exports.createStudentSubmission = function(classId: string,
                                           assignment: FBAssignment): Promise<string> {
  debug('createStudentSubmission', stringify(arguments));
  let responses = assignment.questions.map(question => {
    return {
      question,
      work: [{operation: 'noop', state: [question.question]}]
    };
  });

  let assignmentId = assignment['.key'];
  let studentId = session.get('user').id;
  return submissions.create({
    classId,
    assignmentId,
    studentId,
    responses,
    complete: false
  });
};

exports.getSubmission = function(assignment: FBAssignment, student: FBStudent): Object {
  debug('getSubmission', stringify(arguments));
  let submissionList = assignment.submissions;
  if (!isNonNullObject(submissionList)) {
    return {key: null, submission: null};
  }

  let submission = submissionList[student.id];
  return {key: submission == null ? null : student.id, submission};
};

exports.getStudentSubmission = function(assignment: FBAssignment,
                                        student: ?FBStudent): Object {
  return exports.getSubmission(assignment, student || session.get('user'));
};

exports.containsStudentSubmission = function(assignment: FBAssignment): boolean {
  debug('containsStudentSubmission', stringify(arguments));
  let {key, submission} = exports.getSubmission(assignment, session.get('user'));
  return key != null && submission != null;
};

exports.getStudentStatus = function(assignment: FBAssignment): string {
  debug('getAssignmentStatus', stringify(arguments));
  if (!exports.containsStudentSubmission(assignment)) {
    return 'Not started';
  }

  let {submission} = exports.getStudentSubmission(assignment);
  return submission.complete ? 'Submitted' : 'In progress';
};

exports.getCompleteSubmissionCount = function(assignment: FBAssignment): number {
  return reduce(assignment.submissions, function(count: number, submission: FBSubmission) {
    return count + (submission.complete ? 1 : 0);
  }, 0);
};

exports.getAverage = function(assignment: FBAssignment): string {
  let {total, possible} = values(assignment.submissions)
    .filter((submission: FBSubmission): boolean => submission.complete)
    .map((submission: FBSubmission): string => {
      return submissionHelper.getSubmissionGrade(submission.responses);
    })
    .reduce(function(counts: Object, grade: string): Object {
      let [aTotal, aPossible] = grade.split('/').map(x => parseInt(x));
      return {
        total: counts.total + aTotal,
        possible: counts.possible + aPossible
      };
    }, {total: 0, possible: 0});

  if (possible === 0) {
    return 'n / a';
  }

  return `${round(100 * total / possible)}%`;
};

function countQuestionsByType(assignment: Assignment, type: QuestionType): number {
  return mapValues(
    groupBy(
      assignment.composition,
      (section: AssignmentSection): string => section.type.name
    ),
    (sections: Array<AssignmentSection>): number => {
      return sum(sections.map((section: AssignmentSection): number => section.count));
    }
  )[type.name];
}

function changeTopicCount(assignment: Assignment, index: number, delta: number): Assignment {
  debug('update topic count', stringify(arguments));
  let section = assignment.composition[index];
  section.count += delta;
  if (section.count <= 0) {
    assignment.composition.splice(index, 1);
  }

  assignment.preview = null;
  return assignment;
}

function changeDeadline(assignment: Assignment, delta: number): Assignment {
  debug('update deadline', stringify(arguments));
  let {deadline} = assignment;
  deadline.date(deadline.date() + delta);
  return assignment;
}
