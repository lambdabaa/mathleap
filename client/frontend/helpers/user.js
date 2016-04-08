/* @flow */

let session = require('../session');

import type {FBTeacher, FBUser} from '../../common/types';

exports.isTeacher = function(): boolean {
  let user = session.get('user');
  return user && user.role === 'teacher';
};

exports.isStudent = function(): boolean {
  let user = session.get('user');
  return user && user.role === 'student';
};

exports.isEdmodoUser = function(): boolean {
  let user = session.get('user');
  return user && /^\d+$/.test(user.id);
};

exports.isFTU = function(user: ?FBTeacher): boolean {
  user = user || session.get('user');
  return user && user.ftu;
};

exports.isScratchpadFtu = function(user: ?FBUser): boolean {
  user = user || session.get('user');
  return user && (user.scratchpadFtu == null ||
                  user.scratchpadFtu);
};
