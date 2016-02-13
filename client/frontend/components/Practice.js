let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('./Tabular');
let Topbar = require('./Topbar');
let assignment = require('../helpers/assignment');
let createSafeFirebaseRef = require('../createSafeFirebaseRef');
let session = require('../session');
let users = require('../store/users');

let studentsRef = createSafeFirebaseRef('students');

module.exports = React.createClass({
  displayName: 'Practice',

  mixins: [ReactFire],

  getInitialState: function() {
    return {assignments: []};
  },

  componentWillMount: async function() {
    let {id} = session.get('user');
    this.bindAsArray(
      studentsRef
        .child(id)
        .child('assignments'),
      'assignments'
    );
  },

  render: function() {
    let {assignments} = this.state;
    let rows = assignments.map(anAssignment => {
      // We're storing this as a JSON string in FB since
      // the compositions are apparently not 100% appropriately
      // formatted. Parsing the thing was failing too.
      // This is just terrible though...
      anAssignment.composition = eval(anAssignment.composition);
      return [
        <div className="clickable-text"
             onClick={this._handleOpenPractice.bind(this, anAssignment)}>
          {assignment.getTopics(anAssignment).join(', ')}
        </div>,
        anAssignment.created,
        assignment.getSize(anAssignment)
      ];
    });

    return <div id="practice">
      <Topbar headerText="Practice Mode"
              actions={[
                <a key="classes"
                   className="topbar-action clickable-text"
                   href="#!/classes/">
                  Classes
                </a>,
                <div key="logout"
                     className="topbar-action clickable-text"
                     onClick={users.logout}>
                  Log out
                </div>
              ]} />
      <div className="view">
        <Tabular className="practice-mode"
                 cols={[
                   {content: 'Topics', width: 660},
                   {content: 'Created', width: 140},
                   {content: 'Problems', width: 140}
                 ]}
                 rows={rows} />
        <a className="practice-create-assignment" href="#!/practice/new/">
          <img className="list-action-btn" src="public/style/images/add_btn.png" />
        </a>
        {
          rows.length ?
            '' :
            <div className="view classes-list-ftu">
              Click the plus sign in the upper right corner to choose
              problems to practice.
            </div>
        }
      </div>
    </div>;
  },

  _handleOpenPractice: function(anAssignment) {
    let {submission} = anAssignment;
    let id = anAssignment['.key'];
    location.hash = submission.complete ?
      `#!/practice/${id}/` :
      `#!/practice/${id}/edit/`;
  }
});
