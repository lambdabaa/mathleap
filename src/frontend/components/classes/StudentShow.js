let ClassCode = require('../ClassCode');
let Firebase = require('firebase/lib/firebase-web');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let classes = require('../../store/classes');
let findKey = require('lodash/object/findKey');
let session = require('../../session');
let submissions = require('../../store/submissions');

module.exports = React.createClass({
  displayName: 'classes/StudentShow',

  mixins: [ReactFire],

  getInitialState: function() {
    return {aClass: {}, assignments: []};
  },

  componentWillMount: async function() {
    let {id} = this.props;
    let classRef = new Firebase(`https://mathleap.firebaseio.com/classes/${id}`);
    this.bindAsArray(classRef.child('assignments'), 'assignments');
    let aClass = await classes.get(id);
    this.setState({aClass});
  },

  render: function() {
    let {aClass, assignments} = this.state;

    let headerText = <div className="classes-show-header">
      <div className="classes-show-header-title"
           style={{color: aClass.color}}>
        {aClass.name}
      </div>
      <ClassCode code={aClass.code} />
    </div>;

    let rows = assignments.map(assignment => {
      return [
        <div className="clickable-text"
             onClick={this._handleShowAssignment.bind(this, assignment)}>
          {assignment.name}
        </div>,
        assignment.deadline,
        this._getAssignmentStatus(assignment)
      ];
    });

    return <div id="classes-show-student">
      <Topbar headerText={headerText} />
      <div className="view">
        <div className="backlink clickable-text"
             onClick={() => location.hash = '#!/classes/'}>
          &lt; Classes
        </div>
        <Tabular className="classes-show-student-assignments"
                 cols={[
                   {content: 'Assignment', width: 660},
                   {content: 'Deadline', width: 140},
                   {content: 'Status', width: 140}
                 ]}
                 rows={rows} />
      </div>
    </div>;
  },

  _getAssignmentStatus: function(assignment) {
    let submission = this._getStudentSubmission(assignment);
    if (!submission) {
      return 'Not started';
    }

    return submission.complete ? 'Submitted' : 'In progress';
  },

  _getStudentSubmission: function(assignment) {
    let {uid} = session.get('user');
    let {submissions} = assignment;
    if (!submissions) {
      return null;
    }

    let key = findKey(submissions, submission => submission.studentId === uid);
    if (!key) {
      return null;
    }

    return {key, submission: submissions[key]};
  },

  _handleShowAssignment: async function(assignment) {
    let classId = this.props.id;
    let assignmentId = assignment['.key'];
    let submission = this._getStudentSubmission(assignment);

    let submissionId;
    if (submission) {
      submissionId = submission.key;
    } else {
      // Create a new, in-progress, empty submission.
      let responses = assignment.questions.map(question => {
        return {question, work: [{operation: 'noop', state: [question.question]}]};
      });

      let studentId = session.get('user').uid;
      submissionId = await submissions.create({
        classId,
        assignmentId,
        studentId,
        responses,
        complete: false
      });
    }

    location.hash = `#!/classes/${classId}/assignments/${assignmentId}/submissions/${submissionId}/edit`;
  }
});
