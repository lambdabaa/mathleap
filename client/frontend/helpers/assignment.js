/* @flow */

let classes = require('../store/classes');
let colors = require('../colors');
let debug = require('../../common/debug')('helpers/assignment');
let filter = require('lodash/collection/filter');
let groupBy = require('lodash/collection/groupBy');
let {isNonNullObject} = require('../../common/object');
let map = require('lodash/collection/map');
let mapValues = require('lodash/object/mapValues');
let moment = require('moment');
let questions = require('../store/questions');
let reduce = require('lodash/collection/reduce');
let round = require('../round');
let session = require('../session');
let stringify = require('../../common/stringify');
let students = require('../store/students');
let submissions = require('../store/submissions');
let submissionHelper = require('./submission');
let sum = require('lodash/math/sum');
let uniq = require('lodash/array/uniq');

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
  let created = moment();
  let deadline = moment();
  deadline.date(deadline.date() + 1);
  return {created, deadline, composition: [], preview: null};
};

exports.getSize = function(assignment: Assignment): number {
  let result;
  try {
    result = assignment.composition.reduce((acc, part) => acc + part.count, 0);
  } catch (error) {
    result = 0;
  }

  return result;
};

exports.addTopic = function(assignment: Assignment, topic: QuestionTopic,
                            type: QuestionType): Assignment {
  debug('add topic', stringify(arguments));
  if (countQuestionsByType(assignment, type) >= 10) {
    return assignment;
  }

  let color = colors.random(
    assignment.composition.map((section: AssignmentSection): string => {
      return section.color;
    })
  );

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
    created: assignment.created.format('MM/DD/YY'),
    deadline: assignment.deadline.format('MM/DD/YY'),
    questions: assignment.preview,
    composition: stringify(assignment.composition)
  });
};

exports.practice = async function(assignments: Array<Object>,
                                  assignment: Assignment): Promise<string> {
  debug('create practice');
  if (!Array.isArray(assignment.preview)) {
    assignment.preview = await questions.createAssignment(assignment.composition);
  }

  let responses = assignment.preview.map(question => {
    return {
      question,
      work: [{operation: 'noop', state: [question.question]}]
    };
  });

  return students.createPractice({
    created: assignment.created.format('MM/DD/YY'),
    questions: assignment.preview,
    submission: {responses, complete: false},
    composition: stringify(assignment.composition)
  });
};

exports.findOrCreateSubmission = async function(classId: string,
                                                assignment: FBAssignment): Promise<Object> {
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

exports.getCompleteSubmissionCount = function(assignment: FBAssignment,
                                              studentList: Array<FBStudent>): number {
  return reduce(
    filter(assignment.submissions, function(submission: FBSubmission, key: string): boolean {
      // Make sure this is an actual student.
      return studentList.some((student: FBStudent) => {
        return student.id && student.id === key;
      });
    }),
    function(count: number, submission: FBSubmission) {
      return count + (submission.complete ? 1 : 0);
    },
    0
  );
};

exports.getAverage = async function(assignment: FBAssignment): Promise<string> {
  let {id} = session.get('user');
  let grades = await Promise.all(
    filter(assignment.submissions, function(submission: FBSubmission, key: string): boolean {
      // Don't count any possible test / teacher submissions.
      return !!key && key !== id && submission.complete;
    })
    .map((submission: FBSubmission): Promise<string> => {
      return submissionHelper.getSubmissionGrade(submission.responses);
    })
  );

  if (!grades.length) {
    return 'n / a';
  }

  let {avg} = grades.reduce(
    (acc: Object, next: string) => {
      let grade = eval(`100 * ${next}`);
      let nextAvg = (acc.count * acc.avg + grade) / (acc.count + 1);
      return {count: acc.count + 1, avg: nextAvg};
    },
    {count: 0, avg: 0}
  );

  return `${round(avg)}%`;
};

exports.getTopics = function(assignment: FBAssignment): Array<string> {
  return uniq(
    map(
      assignment.composition,
      (section: AssignmentSection): string => section.topic.name
    )
  ).sort();
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
