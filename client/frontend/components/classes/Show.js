/* @flow */

let Message = require('../Message');
let React = require('react');
let user = require('../../helpers/user');
let users = require('../../store/users');

module.exports = function(props: Object): React.Element {
  if (user.isTeacher()) {
    return React.createElement(require('./TeacherShowContainer'), props);
  }

  if (user.isStudent()) {
    return React.createElement(require('./StudentShowContainer'), props);
  }

  Promise.resolve().then(users.logout);
  return <Message message="Redirecting to homepage..." />;
};
