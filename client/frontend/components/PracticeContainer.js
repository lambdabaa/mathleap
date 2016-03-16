/* @flow */

let Practice = require('./Practice');
let React = require('react');
let ReactFire = require('reactfire');
let createSafeFirebaseRef = require('../createSafeFirebaseRef');
let session = require('../session');

let studentsRef = createSafeFirebaseRef('students');

module.exports = React.createClass({
  displayName: 'Practice',

  mixins: [ReactFire],

  getInitialState: function(): Object {
    return {assignments: []};
  },

  componentWillMount: function(): void {
    let {id} = session.get('user');
    this.bindAsArray(
      studentsRef
        .child(id)
        .child('assignments'),
      'assignments'
    );
  },

  render: function(): React.Element {
    setTimeout(this.props.onload, 0);
    return <Practice assignments={this.state.assignments}
                     openPractice={this._handleOpenPractice} />;
  },

  _handleOpenPractice: function(anAssignment: Object): void {
    let {submission} = anAssignment;
    let id = anAssignment['.key'];
    location.hash = submission.complete ?
      `#!/practice/${id}/` :
      `#!/practice/${id}/edit/`;
  }
});
