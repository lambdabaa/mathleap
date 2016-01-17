/* @flow */

let Firebase = require('firebase/lib/firebase-web');
let debug = require('../../common/debug')('store/assignments');
let {firebaseUrl} = require('../constants');
let request = require('./request');

import type {FBAssignment} from '../../common/types';

let classesRef = new Firebase(`${firebaseUrl}/classes`);

exports.get = async function get(classId: string, assignmentId: string): Promise<FBAssignment> {
  debug('get assignment', classId, assignmentId);
  let assignmentRef = classesRef.child(
    `${classId}/assignments/${assignmentId}`
  );

  let result = await request(assignmentRef, 'once', 'value');
  result.id = assignmentId;
  debug('get assignment ok', JSON.stringify(result));
  return result;
};
