let ClassCode = require('../ClassCode');
let Firebase = require('firebase/lib/firebase-web');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let classes = require('../../store/classes');
let debug = console.log.bind(console, '[components/classes/StudentShow]');
let findKey = require('lodash/object/findKey');
let {firebaseUrl} = require('../../constants');
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
    let classRef = new Firebase(`${firebaseUrl}/classes/${id}`);
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
        getAssignmentStatus(assignment)
      ];
    });

    return <div id="classes-show-student">
      <Topbar headerText={headerText} />
      <div className="view">
        <a className="backlink clickable-text"
           href="#!/classes/">
          &lt; Classes
        </a>
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

  _handleShowAssignment: async function(assignment) {
    let classId = this.props.id;
    let assignmentId = assignment['.key'];
    let {key, submission} = await findOrCreateStudentSubmission(classId, assignment);
    location.hash = submission.complete ?
      `#!/classes/${classId}/assignments/${assignmentId}/submissions/${key}` :
      `#!/classes/${classId}/assignments/${assignmentId}/submissions/${key}/edit`;
  }
});

async function findOrCreateStudentSubmission(classId, assignment) {
  debug('findOrCreateStudentSubmission', JSON.stringify(arguments));
  if (!containsStudentSubmission(assignment)) {
    await createStudentSubmission(classId, assignment);
    assignment.submissions = await submissions.list(
      classId,
      assignment['.key']
    );
  }

  return getStudentSubmission(assignment);
}

function getAssignmentStatus(assignment) {
  debug('getAssignmentStatus', JSON.stringify(arguments));
  if (!containsStudentSubmission(assignment)) {
    return 'Not started';
  }

  return getStudentSubmission(assignment).complete ?
    'Submitted' :
    'In progress';
}

function containsStudentSubmission(assignment) {
  debug('containsStudentSubmission', JSON.stringify(arguments));
  let submissionList = assignment.submissions;
  if (!submissionList) {
    return false;
  }

  let {uid} = session.get('user');
  let key = findKey(submissionList, submission => submission.studentId === uid);
  return !!key;
}

function getStudentSubmission(assignment) {
  debug('getStudentSubmission', JSON.stringify(arguments));
  let submissionList = assignment.submissions;
  let {uid} = session.get('user');
  let key = findKey(submissionList, submission => submission.studentId === uid);
  return {key, submission: submissionList[key]};
}

/**
 * Create a new, in-progress, empty submission.
 */
function createStudentSubmission(classId, assignment) {
  debug('createStudentSubmission', JSON.stringify(arguments));
  let responses = assignment.questions.map(question => {
    return {
      question,
      work: [{operation: 'noop', state: [question.question]}]
    };
  });

  let assignmentId = assignment['.key'];
  let studentId = session.get('user').uid;
  return submissions.create({
    classId,
    assignmentId,
    studentId,
    responses,
    complete: false
  });
}
