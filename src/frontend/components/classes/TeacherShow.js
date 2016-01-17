let ClassCode = require('../ClassCode');
let Firebase = require('firebase/lib/firebase-web');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignment = require('../../helpers/assignment');
let classes = require('../../store/classes');
let debug = require('../../../common/debug')('components/classes/TeacherShow');
let {firebaseUrl} = require('../../constants');
let students = require('../../store/students');

module.exports = React.createClass({
  displayName: 'classes/TeacherShow',

  mixins: [ReactFire],

  getInitialState: function() {
    return {
      aClass: {},
      studentIds: [],
      students: [],
      assignments: []
    };
  },

  componentWillMount: async function() {
    let {id} = this.props;
    let classRef = new Firebase(`${firebaseUrl}/classes/${id}`);
    this.bindAsArray(classRef.child('students'), 'studentIds');
    this.bindAsArray(classRef.child('assignments'), 'assignments');
    let aClass = await classes.get(id);
    this.setState({aClass});
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
    let aClass = this.state.aClass;
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

    let assignments = this.state.assignments.map(anAssignment => {
      return [
        <a className="clickable-text"
           href={`#!/classes/${this.props.id}/assignments/${anAssignment['.key']}/`}>
          {anAssignment.name}
        </a>,
        anAssignment.deadline,
        `${assignment.getCompleteSubmissionCount(anAssignment)} / ${this.state.students.length}`,
        'n / a'
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
                     {content: 'Submissions', width: 130},
                     {content: 'Average', width: 130}
                   ]}
                   rows={assignments} />
          <img className="classes-show-create-assignment list-action-btn"
               src="style/images/add_btn.png"
               onClick={this._handleCreateAssignment} />
        </div>
      </div>
    </div>;
  },

  _handleCreateAssignment: function() {
    debug('add assignment');
    location.hash = `#!/classes/${this.props.id}/assignments/new/`;
  }
});
