let ClassCode = require('../ClassCode');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignment = require('../../helpers/assignment');
let classes = require('../../store/classes');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');
let debug = require('../../../common/debug')('components/classes/TeacherShow');
let students = require('../../store/students');

module.exports = React.createClass({
  displayName: 'classes/TeacherShow',

  mixins: [ReactFire],

  getInitialState: function() {
    return {
      aClass: {},
      studentIds: [],
      students: [],
      assignments: [],
      averages: []
    };
  },

  componentWillMount: async function() {
    let {id} = this.props;
    let classRef = createSafeFirebaseRef(`classes/${id}`);
    this.bindAsArray(classRef.child('students'), 'studentIds');
    this.bindAsArray(classRef.child('assignments'), 'assignments');
    let aClass = await classes.get(id);
    this.setState({aClass});
  },

  componentDidMount: function() {
    this._updateStudents(this.state);
  },

  componentWillUpdate: function(props, state) {
    this._updateStudents(state);
    this._updateAverages(state);
  },

  _updateStudents: async function(state) {
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

  _updateAverages: async function(state) {
    if (state.assignments.length === state.averages.length) {
      return;
    }

    let averages = await Promise.all(state.assignments.map(assignment.getAverage));
    this.setState({averages});
  },

  render: function() {
    let {aClass, averages} = this.state;
    let headerText = <div className="classes-show-header">
      <div className="classes-show-header-title"
           style={{color: aClass.color}}>
        {aClass.name}
      </div>
      <ClassCode code={aClass.code} />
    </div>;

    let studentList = this.state.students.map(student => {
      return [`${student.first} ${student.last} (${student.username})`];
    });

    let assignments = this.state.assignments.map((anAssignment, index) => {
      let completeSubmissionCount = assignment.getCompleteSubmissionCount(anAssignment);
      return [
        <a className="clickable-text"
           href={`#!/classes/${this.props.id}/assignments/${anAssignment['.key']}/`}>
          {anAssignment.name}
        </a>,
        anAssignment.deadline,
        `${completeSubmissionCount} / ${this.state.students.length}`,
        completeSubmissionCount > 0 ? averages[index] : 'n / a',
        <div className="clickable-text emph"
             style={{color: '#eb241d' }}
             onClick={this._handleTryAssignment.bind(this, anAssignment)}>
          Try it!
        </div>
      ];
    });

    return <div id="classes-show-teacher">
      <Topbar headerText={headerText} />
      <div className="view">
        <a className="backlink clickable-text"
           href="#!/classes/">
          &lt; Classes
        </a>
        <div className="classes-show-container">
          <Tabular className="classes-show-students"
                   cols={[{content: 'Students', width: 250}]}
                   rows={studentList} />
          <Tabular className="classes-show-assignments"
                   cols={[
                     {content: 'Assignment', width: 200},
                     {content: 'Deadline', width: 130},
                     {content: 'Submissions', width: 100},
                     {content: 'Avg.', width: 100},
                     {
                       content: <img className="list-action-btn"
                        src="public/style/images/add_btn.png"
                        onClick={this._handleCreateAssignment} />,
                       width: 60
                     }
                    ]}
                   rows={assignments} />
        </div>
        {
          studentList.length || assignments.length ?
            '' :
            <div className="classes-list-ftu">
              Great. Now share the class code <span className="emph">{aClass.code}</span>
              with your students and click the plus sign in the upper right corner
              to assign some problems.
            </div>
        }
      </div>
    </div>;
  },

  _handleCreateAssignment: function() {
    debug('add assignment');
    location.hash = `#!/classes/${this.props.id}/assignments/new/`;
  },

  _handleTryAssignment: async function(anAssignment) {
    let classId = this.props.id;
    let assignmentId = anAssignment['.key'];
    let {key, submission} = await assignment.findOrCreateSubmission(classId, anAssignment);
    location.hash = submission.complete ?
      `#!/classes/${classId}/assignments/${assignmentId}/submissions/${key}` :
      `#!/classes/${classId}/assignments/${assignmentId}/submissions/${key}/edit`;
  }
});