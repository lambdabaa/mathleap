let ClassCode = require('../ClassCode');
let Firebase = require('firebase/lib/firebase-web');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignment = require('../../helpers/assignment');
let classes = require('../../store/classes');
let {firebaseUrl} = require('../../constants');
let users = require('../../store/users');

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

    let rows = assignments.map(anAssignment => {
      return [
        <div className="clickable-text"
             onClick={this._handleShowAssignment.bind(this, anAssignment)}>
          {anAssignment.name}
        </div>,
        anAssignment.deadline,
        assignment.getStudentStatus(anAssignment)
      ];
    });

    return <div id="classes-show-student">
      <Topbar headerText={headerText}
              actions={[
                <a className="topbar-action clickable-text" href="#!/practice/">Practice Mode</a>,
                <div className="topbar-action clickable-text"
                     onClick={users.logout}>
                  Log out
                </div>
              ]} />
      <div className="view">
        <a className="backlink clickable-text" href="#!/classes/">
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

  _handleShowAssignment: async function(anAssignment) {
    let classId = this.props.id;
    let assignmentId = anAssignment['.key'];
    let {key, submission} = await assignment.findOrCreateSubmission(classId, anAssignment);
    location.hash = submission.complete ?
      `#!/classes/${classId}/assignments/${assignmentId}/submissions/${key}/` :
      `#!/classes/${classId}/assignments/${assignmentId}/submissions/${key}/edit/`;
  }
});
