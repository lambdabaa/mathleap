/* @flow */

let React = require('react');
let ReactFire = require('reactfire');
let Show = require('./Show');
let assignments = require('../../store/assignments');
let classes = require('../../store/classes');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');
let firebaseChild = require('../../firebaseChild');
let helper = require('../../helpers/submission');
let session = require('../../session');
let students = require('../../store/students');

import type {FBResponse} from '../../../common/types';

module.exports = React.createClass({
  displayName: 'submissions/Show',

  mixins: [ReactFire],

  getInitialState: function(): Object {
    return {
      headerText: '',
      aClass: {},
      assignment: {},
      submission: {},
      student: {},
      marks: []
    };
  },

  // $FlowFixMe
  componentWillMount: async function(): Promise<void> {
    let redirect = this._isSubmissionIncomplete();
    if (redirect) {
      return this._redirectToEditSubmission();
    }

    let {aClass, assignment, submission, id} = this.props;
    let user = session.get('user');

    if (aClass) {
      // $FlowFixMe
      this.isPracticeMode = false;
      this.bindAsArray(
        createSafeFirebaseRef(`classes/${aClass}/assignments/${assignment}/submissions/${submission}/`),
        'submission'
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
        createSafeFirebaseRef(`students/${user.id}/assignments/${id}/submission/`),
        'submission'
      );

      let theAssignment = await assignments.getPractice(id);
      let student = await students.get(user.id);
      this.setState({assignment: theAssignment, student});
    } else {
      throw new Error('Nowhere to find responses!');
    }
  },

  componentWillUpdate: function(props: Object, state: Object): void {
    let redirect = this._isSubmissionIncomplete(state);
    if (redirect) {
      return this._redirectToEditSubmission();
    }

    this._updateHeaderText(state);
    this._updateMarks(state);
  },

  _updateHeaderText: async function(state: Object): Promise<void> {
    if (state.headerText.length) {
      return;
    }

    let {student, assignment} = state;
    let responses = this._getResponses();
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
    let responses = this._getResponses(state);
    if (state.marks.length === responses.length) {
      return;
    }

    let marks = await Promise.all(responses.map(response => {
      let {question, work} = response;
      let answer = work[work.length - 1].state[0];
      return helper.isCorrect(question, answer, work);
    }));

    this.setState({marks});
  },

  render: function(): React.Element {
    return <Show user={session.get('user')}
                 headerText={this.state.headerText}
                 aClass={this.state.aClass}
                 classId={this.props.aClass}
                 assignment={this.state.assignment}
                 student={this.state.student}
                 responses={this._getResponses()}
                 marks={this.state.marks}
                 isPracticeMode={this.isPracticeMode}
                 showModal={this.props.showModal}
                 displayModalError={this.props.displayModalError}
                 displayModalSuccess={this.props.displayModalSuccess}
                 clearMessages={this.props.clearMessages} />;
  },

  _getResponses: function(state: ?Object): Array<FBResponse> {
    if (!state) {
      state = this.state;
    }

    let {submission} = state;
    return firebaseChild.findArrayChild(submission);
  },

  _isSubmissionIncomplete: function(state: ?Object): boolean {
    if (!state) {
      state = this.state;
    }

    let {submission} = state;
    let complete = firebaseChild.findByKey(submission, 'complete');
    return typeof complete === 'boolean' ? !complete : false;
  },

  _redirectToEditSubmission: function(): void {
    if (location.hash.indexOf('edit') !== -1) {
      return;
    }

    location.hash = location.hash
      .split('/')
      .filter((part: string) => !!part.length)
      .concat('edit')
      .join('/');
  }
});
