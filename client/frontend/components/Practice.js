/* @flow */

let React = require('react');
let Tabular = require('./Tabular');
let Topbar = require('./Topbar');
let assignment = require('../helpers/assignment');
let users = require('../store/users');

function Practice(props: Object): React.Element {
  let {assignments} = props;
  let rows = assignments.map(anAssignment => {
    // We're storing this as a JSON string in FB since
    // the compositions are apparently not 100% appropriately
    // formatted. Parsing the thing was failing too.
    // This is just terrible though...
    anAssignment.composition = eval(anAssignment.composition);
    return [
      <div className="clickable-text"
           onClick={props.openPractice.bind(props, anAssignment)}>
        {assignment.getTopics(anAssignment).join(', ')}
      </div>,
      anAssignment.created,
      assignment.getSize(anAssignment),
      ''
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
    {
      rows.length ?
        '' :
        <div className="view classes-list-ftu">
          Click the plus button below to choose problems to practice.
        </div>
    }
    <div className="view">
      <Tabular className="practice-mode"
               cols={[
                 {content: 'Topics', width: 640},
                 {content: 'Created', width: 120},
                 {content: 'Size', width: 70},
                 {
                   content: <a className="practice-create-assignment button-action try-it-button tabular-button"
                               href="#!/practice/new/">
                     + Practice
                   </a>,
                   width: 110
                 }
               ]}
               rows={rows} />
    </div>
  </div>;
}

module.exports = Practice;
