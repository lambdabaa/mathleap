/* @flow */

let session = require('../session');

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

exports.isFTU = function(): boolean {
  let user = session.get('user');
  return user && user.ftu;
};
