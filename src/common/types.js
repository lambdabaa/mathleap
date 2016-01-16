/* @flow */

export type AssignmentQuestion = {
  question: string;
  solution: number | string;
};

export type QuestionType = {
  name: string;
  example: string;
  questions: Array<AssignmentQuestion>;
};

export type QuestionTopic = {
  name: string;
  types: Array<QuestionType>;
};

export type AssignmentSection = {
  topic: QuestionTopic;
  type: QuestionType;
  color: string;
  count: number;
};

export type Assignment = {
  deadline: Object;
  composition: Array<AssignmentSection>;
  preview: ?Array<AssignmentQuestion>;
};

export type FBClass = {
  assignments: Object;
  code: string;
  color: string;
  name: string;
  students: Object;
  teacher: string;
};

export type FBAssignment = {
  '.key': string;
  name: string;
  deadline: string;
  questions: Object;
  submissions: Object;
};

export type FBStudent = {
  '.key': string;
  email: string;
  first: string;
  last: string;
  role: string;
  uid: string;
  username: string;
};

export type FBSubmission = {
  '.key': string;
  assignmentId: string;
  classId: string;
  studentId: string;
  complete: boolean;
  responses: Array<FBResponse>;
};

export type FBResponse = {
  question: AssignmentQuestion;
  work: Array<FBQuestionStep>;
};

export type FBQuestionStep = {
  operation: string;
  state: Array<string>;
};
