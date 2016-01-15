/* @flow */

let classes = require('../store/classes');
let colors = require('../colors');
let debug = console.log.bind(console, '[helpers/assignment]');
let findKey = require('lodash/object/findKey');
let moment = require('moment');
let questions = require('../store/questions');
let reduce = require('lodash/collection/reduce');
let session = require('../session');
let stringify = require('json-stringify-safe');
let submissions = require('../store/submissions');

import type {
  QuestionType,
  QuestionTopic,
  Assignment,
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
  return assignment.composition.reduce((sum, part) => sum + part.count, 0);
};

exports.addTopic = function(assignment: Assignment, topic: QuestionTopic,
                            type: QuestionType): Assignment {
  debug('add topic', stringify(arguments));
  let color = colors.random();
  assignment.composition.push({topic, type, color, count: 1});
  assignment.preview = null;
  return assignment;
};

exports.incrementTopicCount = function(assignment: Assignment, index: number): Assignment {
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
                                           assignment: FBAssignment): Promise<FBSubmission> {
  debug('createStudentSubmission', stringify(arguments));
  let responses = assignment.questions.map(question => {
    return {
      question,
      work: [{operation: 'noop', state: [question.question]}]
    };
  });

  let assignmentId = assignment['.key'];
  let studentId = session.get('user').uid;
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
  let {uid} = student;
  let key = findKey(submissionList, function(submission: FBSubmission): boolean {
    return submission.studentId === uid;
  });

  return key == null ?
    {key: null, submission: null} :
    {key, submission: submissionList[key]};
};

exports.getStudentSubmission = function(assignment: FBAssignment): Object {
  return exports.getSubmission(assignment, session.get('user'));
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
