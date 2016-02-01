/* @flow */

let React = require('react');
let StudentShow = require('./StudentShow');
let TeacherShow = require('./TeacherShow');
let session = require('../../session');

module.exports = function(props: Object): React.Element {
  let user = session.get('user');
  if (!user) {
    return <h1>Redirecting to homepage</h1>;
  }

  switch (user.role) {
    case 'student':
      return <StudentShow props={props} />;
    case 'teacher':
      return <TeacherShow props={props} />;
    default:
      throw new Error(`Unexpected user role ${user.role}`);
  }
};
