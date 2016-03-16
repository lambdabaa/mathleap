/* @flow */

let React = require('react');
let ReactFire = require('reactfire');
let StudentShow = require('./StudentShow');
let assignment = require('../../helpers/assignment');
let classes = require('../../store/classes');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');

module.exports = React.createClass({
  displayName: 'classes/StudentShow',

  mixins: [ReactFire],

  getInitialState: function(): Object {
    return {aClass: {}, assignments: []};
  },

  // $FlowFixMe
  componentWillMount: async function(): Promise<void> {
    let {id} = this.props;
    let classRef = createSafeFirebaseRef(`classes/${id}`);
    this.bindAsArray(classRef.child('assignments'), 'assignments');
    let aClass = await classes.get(id);
    this.setState({aClass});
  },

  componentDidMount: function() {
    this.props.onload();
  },

  render: function(): React.Element {
    return <StudentShow aClass={this.state.aClass}
                        assignments={this.state.assignments}
                        showAssignment={this._handleShowAssignment} />;
  },

  _handleShowAssignment: async function(anAssignment: Object): Promise<void> {
    let classId = this.props.id;
    let assignmentId = anAssignment['.key'];
    let {key, submission} = await assignment.findOrCreateSubmission(classId, anAssignment);
    location.hash = submission.complete ?
      `#!/classes/${classId}/assignments/${assignmentId}/submissions/${key}/` :
      `#!/classes/${classId}/assignments/${assignmentId}/submissions/${key}/edit/`;
  }
});
