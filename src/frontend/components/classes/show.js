let React = require('react');
let session = require('../../session');

module.exports = React.createClass({
  displayName: 'classes/show',

  getInitialState: function() {
    return {user: session.get('user')};
  },

  componentWillMount: function() {
    session.on('user', this._onUser);
  },

  componentWillUnmount: function() {
    session.removeListener('user', this._onUser);
  },

  render: function() {
    let user = this.state.user;
    switch (user.role) {
      case 'student':
        return React.createElement(require('./student_show'), this.props);
      case 'teacher':
        return React.createElement(require('./teacher_show'), this.props);
      default:
        throw new Error(`Unexpected user role ${user.role}`);
    }
  },

  _onUser: function(user) {
    this.setState({user});
  }
});
