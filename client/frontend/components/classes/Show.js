/* @flow */

let React = require('react');
let session = require('../../session');

module.exports = function(props: Object): React.Element {
  let user = session.get('user');
  if (!user) {
    return <h1>Redirecting to homepage</h1>;
  }

  switch (user.role) {
    case 'student':
      return React.createElement(require('./StudentShowContainer'), props);
    case 'teacher':
      return React.createElement(require('./TeacherShowContainer'), props);
    default:
      throw new Error(`Unexpected user role ${user.role}`);
  }
};
