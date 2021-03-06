/* @flow */

let Message = require('../Message');
let React = require('react');
let user = require('../../helpers/user');
let users = require('../../store/users');

function List(props: Object): React.Element {
  if (user.isTeacher()) {
    return React.createElement(require('./TeacherListContainer'), props);
  }

  if (user.isStudent()) {
    return React.createElement(require('./StudentListContainer'), props);
  }

  Promise.resolve().then(users.logout);
  return <Message message="Redirecting to homepage..." />;
}

module.exports = List;
