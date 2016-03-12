/* @flow */

let React = require('react');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignment = require('../../helpers/assignment');
let format = require('../../helpers/format');

import type {FBStudent} from '../../../common/types';

module.exports = function(props: Object): React.Element {
  let {aClass, classId, theAssignment} = props;
  return <div id="assignments-show">
    <Topbar headerText={theAssignment ? theAssignment.name : ''}
            showModal={props.showModal}
            displayModalError={props.displayModalError}
            displayModalSuccess={props.displayModalSuccess}
            clearMessages={props.clearMessages} />
    <div className="view">
      <a className="backlink clickable-text"
         href={`#!/classes/${classId}/`}>
        &lt; {aClass && aClass.name}
      </a>
      <a className="insights-dashboard-link"
         href={`#!/classes/${classId}/assignments/${theAssignment.id}/insights/`}>
        Class Performance
      </a>
      <Tabular cols={[
                 {content: 'Student', width: 495},
                 'Status',
                 'Grade'
               ]}
               rows={renderSubmissions(props)} />
    </div>
  </div>;
};

function renderSubmissions(props: Object): Array<Array<React.Element | string>> {
  let {aClass, theAssignment, students, grades} = props;
  return students.map((student: FBStudent) => {
    let {key, submission} = assignment.getSubmission(theAssignment, student);
    let status;
    if (key) {
      status = submission.complete ?
        <a className="clickable-text"
           href={`#!/classes/${aClass.id}/assignments/${theAssignment.id}/submissions/${key}/`}>
          <div style={{color: '#3996f0'}}>Submitted</div>
        </a> :
        'In progress';
    } else {
      status = <div style={{color: '#808080'}}>Not started</div>;
    }

    return [
      format.student(student),
      status,
      submission && submission.complete ? grades[key] : 'n / a'
    ];
  });
}
