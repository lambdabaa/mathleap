/* @flow */

let ClassCode = require('../ClassCode');
let React = require('react');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignment = require('../../helpers/assignment');
let format = require('../../helpers/format');

module.exports = function(props: Object): React.Element {
  let {aClass, id, students, averages} = props;
  let headerText = <div className="classes-show-header">
    <div className="classes-show-header-title"
         style={{color: aClass.color}}>
      {aClass.name}
    </div>
    <ClassCode code={aClass.code} />
  </div>;

  let studentList = students.map(student => {
    return [format.student(student)];
  });

  let assignments = props.assignments.map((anAssignment, index) => {
    let completeSubmissionCount = assignment.getCompleteSubmissionCount(anAssignment, students);
    return [
      <a className="clickable-text"
         href={`#!/classes/${id}/assignments/${anAssignment['.key']}/`}>
        {anAssignment.name}
      </a>,
      anAssignment.deadline,
      `${completeSubmissionCount} / ${students.length}`,
      completeSubmissionCount > 0 ? averages[index] : 'n / a',
      <div className="button-action try-it-button"
           onClick={() => props.tryAssignment(anAssignment)}>
        Try it!
      </div>
    ];
  });

  return <div id="classes-show-teacher">
    <Topbar headerText={headerText}
            showModal={props.showModal}
            displayModalError={props.displayModalError}
            displayModalSuccess={props.displayModalSuccess}
            clearMessages={props.clearMessages} />
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
                   {content: 'Assignment', width: 190},
                   {content: 'Deadline', width: 120},
                   {content: 'Submissions', width: 110},
                   {content: 'Avg.', width: 90},
                   {
                     content: <img className="list-action-btn"
                      src="public/style/images/add_btn.png"
                      style={{float: 'right'}}
                      onClick={props.createAssignment} />,
                     width: 80
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
};
