/* @flow */

let React = require('react');
let ReactFire = require('reactfire');
let TeacherShow = require('./TeacherShow');
let assignment = require('../../helpers/assignment');
let classes = require('../../store/classes');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');
let debug = require('../../../common/debug')('components/classes/TeacherShow');
let students = require('../../store/students');

import type {FBStudent} from '../../../common/types';

module.exports = React.createClass({
  displayName: 'classes/TeacherShow',

  mixins: [ReactFire],

  getInitialState: function(): Object {
    return {
      aClass: {},
      studentIds: [],
      students: [],
      assignments: [],
      averages: []
    };
  },

  // $FlowFixMe
  componentWillMount: async function(): Promise<void> {
    let {id} = this.props;
    let classRef = createSafeFirebaseRef(`classes/${id}`);
    this.bindAsArray(classRef.child('students'), 'studentIds');
    this.bindAsArray(classRef.child('assignments'), 'assignments');
    let aClass = await classes.get(id);
    this.setState({aClass});
  },

  componentDidMount: function(): void {
    this._updateStudents(this.state);
  },

  componentWillUpdate: function(props: Object, state: Object): void {
    this._updateStudents(state);
    this._updateAverages(state);
  },

  _updateStudents: async function(state: Object): Promise<void> {
    let clean =
      state.studentIds.length === state.students.length &&
      state.students.every((student, index) => {
        return student ?
          student.id === state.studentIds[index]['.value'] :
          true;
      });

    if (clean) {
      return;
    }

    // ReactFire keeps the list of studentIds who are in this class up-to-date
    // but it's our job to turn those into actual students.
    let ids = state.studentIds.map(obj => obj['.value']);
    let update = await Promise.all(ids.map(students.get));
    this.setState({students: update});
  },

  _updateAverages: async function(state: Object): Promise<void> {
    if (state.assignments.length === state.averages.length) {
      return;
    }

    let averages = await Promise.all(state.assignments.map(assignment.getAverage));
    this.setState({averages});
  },

  render: function(): React.Element {
    this.props.onload();
    let studentList = this.state.students.filter((student: ?FBStudent) => {
      return student != null;
    });

    return <TeacherShow id={this.props.id}
                        aClass={this.state.aClass}
                        students={studentList}
                        assignments={this.state.assignments}
                        averages={this.state.averages}
                        showModal={this.props.showModal}
                        displayModalError={this.props.displayModalError}
                        displayModalSuccess={this.props.displayModalSuccess}
                        clearMessages={this.props.clearMessages}
                        createAssignment={this._handleCreateAssignment}
                        tryAssignment={this._handleTryAssignment} />;
  },

  _handleCreateAssignment: function(): void {
    debug('add assignment');
    location.hash = `#!/classes/${this.props.id}/assignments/new/`;
  },

  _handleTryAssignment: async function(anAssignment: Object): Promise<void> {
    let classId = this.props.id;
    let assignmentId = anAssignment['.key'];
    let {key, submission} = await assignment.findOrCreateSubmission(classId, anAssignment);
    location.hash = submission.complete ?
      `#!/classes/${classId}/assignments/${assignmentId}/submissions/${key}` :
      `#!/classes/${classId}/assignments/${assignmentId}/submissions/${key}/edit`;
  }
});
