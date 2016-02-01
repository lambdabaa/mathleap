/* @flow */

let React = require('react');
let StudentList = require('./StudentList');
let TeacherList = require('./TeacherList');
let session = require('../../session');

module.exports = function(props: Object): React.Element {
  let user = session.get('user');
  if (!user) {
    return <h1>Redirecting to homepage</h1>;
  }

  switch (user.role) {
    case 'student':
      return <StudentList props={props} />;
    case 'teacher':
      return <TeacherList props={props} />;
    default:
      throw new Error(`Unexpected user role ${user.role}`);
  }
};
