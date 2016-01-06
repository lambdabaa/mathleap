let Firebase = require('firebase/lib/firebase-web');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignments = require('../../store/assignments');
let classes = require('../../store/classes');
let findKey = require('lodash/object/findKey');
let {firebaseUrl} = require('../../constants');
let students = require('../../store/students');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      aClass: {},
      assignment: {},
      students: [],
      studentIds: []
    };
  },

  mixins: [ReactFire],

  componentWillMount: async function() {
    let {aClass, assignment} = this.props;
    let classRef = new Firebase(`${firebaseUrl}/classes/${aClass}`);
    this.bindAsArray(classRef.child('students'), 'studentIds');

    let [theClass, theAssignment] = await Promise.all([
      classes.get(aClass),
      assignments.get(aClass, assignment)
    ]);

    this.setState({aClass: theClass, assignment: theAssignment});
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
    this.setState({students: update});
  },

  render: function() {
    let {aClass, assignment} = this.state;
    return <div id="assignments-show">
      <Topbar headerText={assignment.name || ''} />
      <div className="view">
        <div className="backlink clickable-text"
             onClick={this._handleBack}>
          &lt; {aClass && aClass.name}
        </div>
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
    let {assignment} = this.state;
    return this.state.students.map(student => {
      let {key, submission} = getStudentSubmission(assignment, student);
      let status;
      if (key) {
        status = submission.complete ?
          <div className="clickable-text"
               onClick={this._openSubmission.bind(this, key)}>
            <div style={{color: '#3996f0'}}>Submitted</div>
          </div> :
          'In progress';
      } else {
        status = <div style={{color: '#808080'}}>Not started</div>;
      }

      return [
        `${student.first} ${student.last} (${student.username})`,
        status,
        'n / a'
      ];
    });
  },

  _handleBack: function() {
    location.hash = `#!/classes/${this.props.aClass}/`;
  },

  _openSubmission: function(submission) {
    let {aClass, assignment} = this.props;
    location.hash = `#!/classes/${aClass}/assignments/${assignment}/submissions/${submission}`;
  }
});

function getStudentSubmission(assignment, student) {
  let submissionList = assignment.submissions;
  let {uid} = student;
  let key = findKey(submissionList, submission => submission.studentId === uid);
  return {key, submission: submissionList[key]};
}
