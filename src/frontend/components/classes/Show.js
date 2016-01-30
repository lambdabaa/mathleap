let React = require('react');
let session = require('../../session');

module.exports = React.createClass({
  displayName: 'classes/Show',

  render: function() {
    let user = session.get('user');
    if (!user) {
      return <h1>Redirecting to homepage</h1>;
    }

    switch (user.role) {
      case 'student':
        return React.createElement(require('./StudentShow'), this.props);
      case 'teacher':
        return React.createElement(require('./TeacherShow'), this.props);
      default:
        throw new Error(`Unexpected user role ${user.role}`);
    }
  }
});
