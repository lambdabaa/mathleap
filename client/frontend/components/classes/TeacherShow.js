/* @flow */

let ClassCode = require('../ClassCode');
let React = require('react');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignment = require('../../helpers/assignment');
let format = require('../../helpers/format');

function TeacherShow(props: Object): React.Element {
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
      <div className="button-inverse try-it-button"
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
    <div className="view classes-list-ftu">
      {
        studentList.length && assignments.length ?
          'Click on an assignment below to view student submissions.' :
          <div>
            Great. Now share the class code <span className="emph">{aClass.code}</span>
            with your students and click the plus button below to assign some problems.
          </div>
      }
    </div>
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
                   {content: 'Assignment', width: 180},
                   {content: 'Deadline', width: 120},
                   {content: 'Done', width: 70},
                   {content: 'Avg.', width: 70},
                   {
                     content: <div className="button-action try-it-button"
                                   onClick={props.createAssignment}>
                      + Assignment
                     </div>,
                     width: 150
                   }
                  ]}
                 rows={assignments} />
      </div>
    </div>
  </div>;
}

module.exports = TeacherShow;
