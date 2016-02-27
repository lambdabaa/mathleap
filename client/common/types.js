/* @flow */

export type KeyboardEvent = {
  ctrlKey: boolean;
  metaKey: boolean;
  key: string;
  keyCode: number;
  preventDefault: Function;
  stopPropagation: Function;
};

export type AccessToken = {
  access_token: string;
  token_type: string;
  expires_in: string;
};

export type AssignmentQuestion = {
  question: string;
  solution: number | string;
  instruction?: string;
};

export type QuestionType = {
  name: string;
  example: string;
  instruction?: string;
  questions: Array<AssignmentQuestion>;
};

export type QuestionTopic = {
  name: string;
  types: Array<QuestionType>;
  instruction?: string;
};

export type AssignmentSection = {
  topic: QuestionTopic;
  type: QuestionType;
  color: string;
  count: number;
};

export type Assignment = {
  created: Object;
  deadline: Object;
  composition: Array<AssignmentSection>;
  preview: ?Array<AssignmentQuestion>;
};

export type FBClass = {
  id: ?string;
  assignments: Object;
  code: string;
  color: string;
  name: string;
  students: Object;
  teacher: string;
};

export type FBAssignment = {
  '.key': string;
  id: ?string;
  name: string;
  created?: string;
  composition?: Array<Object> | string;
  deadline: string;
  questions: Object;
  submissions: Object;
};

export type FBPractice = {
  '.key': string;
  id: ?string;
  created: string;
  composition: Array<Object> | string;
  questions: Object;
  submission: Object;
};

export type FBTeacher = {
  id: ?string;
  email: string;
  first: string;
  last: string;
  role: string;
  title: string;
};

export type FBStudent = {
  id: ?string;
  email: string;
  first: string;
  last: string;
  role: string;
  username: string;
};

export type FBSubmission = {
  '.key': string;
  id: ?string;
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
  error: boolean;
};

export type Numeric = string | number;

export type Range = {start: number, end: number};
