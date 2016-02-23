/* @flow */

let React = require('react');
let ReactFire = require('reactfire');
let Show = require('./Show');
let assignment = require('../../helpers/assignment');
let assignments = require('../../store/assignments');
let classes = require('../../store/classes');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');
let students = require('../../store/students');
let submissionHelper = require('../../helpers/submission');

module.exports = React.createClass({
  mixins: [ReactFire],

  getInitialState: function(): Object {
    return {
      aClass: {},
      theAssignment: {},
      students: [],
      studentIds: [],
      grades: {}
    };
  },

  // $FlowFixMe: React expects this to be void not Promise<void>
  componentWillMount: async function(): Promise<void> {
    let classRef = createSafeFirebaseRef(`classes/${this.props.aClass}`);
    this.bindAsArray(classRef.child('students'), 'studentIds');

    let [theClass, theAssignment] = await Promise.all([
      classes.get(this.props.aClass),
      assignments.get(this.props.aClass, this.props.assignment)
    ]);

    this.setState({aClass: theClass, theAssignment});
  },

  componentDidMount: function(): void {
    this._updateStudents(this.state);
  },

  componentWillUpdate: function(props: Object, state: Object): void {
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

    this._updateStudents(state);
  },

  _updateStudents: async function(state: Object): Promise<void> {
    // ReactFire keeps the list of studentIds who are in this class up-to-date
    // but it's our job to turn those into actual students.
    let ids = state.studentIds.map(obj => obj['.value']);
    let update = await Promise.all(ids.map(students.get));
    let grades = state.grades;
    await Promise.all(
      update.map(async (aStudent) => {
        let {key, submission} = assignment.getSubmission(state.theAssignment, aStudent);
        if (!submission) {
          return;
        }

        grades[key] = await submissionHelper.getSubmissionGrade(submission.responses);
      })
    );

    this.setState({students: update});
  },

  render: function(): React.Element {
    return <Show aClass={this.state.aClass}
                 classId={this.props.aClass}
                 theAssignment={this.state.theAssignment}
                 students={this.state.students}
                 grades={this.state.grades} />;
  }
});
