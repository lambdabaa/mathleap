let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignment = require('../../helpers/assignment');
let assignments = require('../../store/assignments');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');
let classes = require('../../store/classes');
let format = require('../../helpers/format');
let students = require('../../store/students');
let submissionHelper = require('../../helpers/submission');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      aClass: {},
      theAssignment: {},
      students: [],
      studentIds: [],
      grades: {}
    };
  },

  mixins: [ReactFire],

  componentWillMount: async function() {
    let classRef = createSafeFirebaseRef(`classes/${this.props.aClass}`);
    this.bindAsArray(classRef.child('students'), 'studentIds');

    let [theClass, theAssignment] = await Promise.all([
      classes.get(this.props.aClass),
      assignments.get(this.props.aClass, this.props.assignment)
    ]);

    this.setState({aClass: theClass, theAssignment});
  },

  componentDidMount: function() {
    this._updateStudents(this.state);
  },

  componentWillUpdate: function(props, state) {
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

  _updateStudents: async function(state) {
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

  render: function() {
    let {aClass, theAssignment} = this.state;
    return <div id="assignments-show">
      <Topbar headerText={theAssignment.name || ''} />
      <div className="view">
        <a className="backlink clickable-text"
           href={`#!/classes/${this.props.aClass}/`}>
          &lt; {aClass && aClass.name}
        </a>
        <Tabular cols={[
                   {content: 'Student', width: 495},
                   'Status',
                   'Grade'
                 ]}
                 rows={this._renderSubmissions()} />
      </div>
    </div>;
  },

  _renderSubmissions: function() {
    let {aClass, theAssignment, grades} = this.state;
    return this.state.students.map(student => {
      let {key, submission} = assignment.getSubmission(theAssignment, student);
      let status;
      if (key) {
        status = submission.complete ?
          <a className="clickable-text"
             href={`#!/classes/${aClass.id}/assignments/${theAssignment.id}/submissions/${key}/`}>
            <div style={{color: '#3996f0'}}>Submitted</div>
          </a> :
          'In progress';
      } else {
        status = <div style={{color: '#808080'}}>Not started</div>;
      }

      return [
        format.student(student),
        status,
        submission.complete ? grades[key] : 'n / a'
      ];
    });
  }
});
