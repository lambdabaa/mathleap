/* @flow */

let React = require('react');
let ReactFire = require('reactfire');
let Show = require('./Show');
let assignments = require('../../store/assignments');
let classes = require('../../store/classes');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');
let helper = require('../../helpers/submission');
let session = require('../../session');
let students = require('../../store/students');

module.exports = React.createClass({
  displayName: 'submissions/Show',

  mixins: [ReactFire],

  getInitialState: function(): Object {
    return {
      headerText: '',
      aClass: {},
      assignment: {},
      student: {},
      responses: [],
      marks: []
    };
  },

  // $FlowFixMe
  componentWillMount: async function(): Promise<void> {
    let {aClass, assignment, submission, id} = this.props;
    let user = session.get('user');

    if (aClass) {
      // $FlowFixMe
      this.isPracticeMode = false;
      this.bindAsArray(
        createSafeFirebaseRef(`classes/${aClass}/assignments/${assignment}/submissions/${submission}/responses`),
        'responses'
      );

      let [theClass, theAssignment] = await Promise.all([
        classes.get(aClass),
        assignments.get(aClass, assignment)
      ]);

      if (user.role === 'teacher') {
        return this.setState({aClass: theClass, assignment: theAssignment});
      }

      let student = await students.get(
        theAssignment.submissions[submission].studentId
      );

      this.setState({aClass: theClass, assignment: theAssignment, student});
    } else if (id) {
      // $FlowFixMe
      this.isPracticeMode = true;
      this.bindAsArray(
        createSafeFirebaseRef(`students/${user.id}/assignments/${id}/submission/responses`),
        'responses'
      );

      let theAssignment = await assignments.getPractice(id);
      let student = await students.get(user.id);
      this.setState({assignment: theAssignment, student});
    } else {
      throw new Error('Nowhere to find responses!');
    }
  },

  componentWillUpdate: function(props: Object, state: Object): void {
    this._updateHeaderText(state);
    this._updateMarks(state);
  },

  _updateHeaderText: async function(state: Object): Promise<void> {
    if (state.headerText.length) {
      return;
    }

    let {student, assignment, responses} = state;
    let user = session.get('user');
    if (user.role === 'teacher') {
      if (typeof assignment.name !== 'string' ||
          !responses.length) {
        return;
      }

      let headerText = await helper.getHeaderText(user, assignment, responses);
      return this.setState({headerText});
    }

    if (typeof student.id !== 'string' || !responses.length) {
      return;
    }

    let headerText = await helper.getHeaderText(student, assignment, responses);
    this.setState({headerText});
  },

  _updateMarks: async function(state: Object): Promise<void> {
    if (state.marks.length === state.responses.length) {
      return;
    }

    let marks = await Promise.all(
      state.responses.map(response => {
        let {question, work} = response;
        let answer = work[work.length - 1].state[0];
        return helper.isCorrect(question, answer, work);
      })
    );

    this.setState({marks});
  },

  render: function(): React.Element {
    return <Show user={session.get('user')}
                 headerText={this.state.headerText}
                 aClass={this.state.aClass}
                 classId={this.props.aClass}
                 assignment={this.state.assignment}
                 student={this.state.student}
                 responses={this.state.responses}
                 marks={this.state.marks}
                 isPracticeMode={this.isPracticeMode} />;
  }
});
