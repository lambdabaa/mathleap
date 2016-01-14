/* @flow */
let classes = require('../store/classes');
let colors = require('../colors');
let debug = console.log.bind(console, '[helpers/assignment]');
let moment = require('moment');
let questions = require('../store/questions');
let stringify = require('json-stringify-safe');

type AssignmentQuestion = {
  question: string;
  solution: number | string;
};

type QuestionType = {
  name: string;
  example: string;
  questions: Array<AssignmentQuestion>;
};

type QuestionTopic = {
  name: string;
  types: Array<QuestionType>;
};

type AssignmentSection = {
  topic: QuestionTopic;
  type: QuestionType;
  color: string;
  count: number;
};

type Assignment = {
  deadline: Object;
  composition: Array<AssignmentSection>;
  preview: ?Array<AssignmentQuestion>;
};

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
