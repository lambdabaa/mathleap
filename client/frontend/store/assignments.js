/* @flow */

let createSafeFirebaseRef = require('../createSafeFirebaseRef');
let debug = require('../../common/debug')('store/assignments');
let request = require('./request');
let session = require('../session');

import type {FBAssignment} from '../../common/types';

let classesRef = createSafeFirebaseRef('classes');
let studentsRef = createSafeFirebaseRef('students');

exports.get = async function get(classId: string, assignmentId: string): Promise<FBAssignment> {
  return doGet(
    assignmentId,
    classesRef
      .child(classId)
      .child('assignments')
      .child(assignmentId)
  );
};

exports.getPractice = function(assignmentId: string): Promise<FBAssignment> {
  let user = session.get('user');
  return doGet(
    assignmentId,
    studentsRef
      .child(user.id)
      .child('assignments')
      .child(assignmentId)
  );
};

async function doGet(id: string, ref: createSafeFirebaseRef.SafeFirebase): Promise<FBAssignment> {
  debug('get assignment', ref.toString());
  let result = await request(ref, 'once', 'value');
  result.id = id;

  if ('composition' in result) {
    // TODO: wtf...
    result.composition = eval(result.composition);
  }

  debug('get assignment ok', JSON.stringify(result));
  return result;
}
