/* @flow */

let ClassCode = require('../ClassCode');
let React = require('react');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignment = require('../../helpers/assignment');
let users = require('../../store/users');

module.exports = function(props: Object): React.Element {
  let {aClass, assignments} = props;

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
           onClick={() => props.showAssignment.bind(anAssignment)}>
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
};
