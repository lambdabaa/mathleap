/* @flow */

let {Chart} = require('react-google-charts');
let Message = require('../Message');
let React = require('react');
let Topbar = require('../Topbar');
let countBy = require('lodash/collection/countBy');
let map = require('lodash/collection/map');
let round = require('../../round');

module.exports = function(props: Object): React.Element {
  let {classId, theAssignment, grades} = props;
  let data = [['Grade', 'Count']];
  let rows = map(
    countBy(
      grades,
      (grade: string): number => round(eval(`100 * ${grade}`))
    ),
    (count: number, grade: string) => {
      return [grade, count];
    }
  );

  if (!rows.length) {
    return <Message message="Loading performance data..." />;
  }

  data = data.concat(rows);

  return <div id="assignments-insights">
    <Topbar headerText={`${theAssignment.name || ''} Performance`} />
    <div className="view">
      <a className="backlink clickable-text"
         href={`#!/classes/${classId}/assignments/${theAssignment.id}/`}>
        &lt; {theAssignment && theAssignment.name}
      </a>
      <Chart chartType="ColumnChart"
             height="400px"
             width="990px"
             columns={['Grade', 'Count']}
             data={data}
             options={{
               title: `Distribution of Grades on ${theAssignment.name}`,
               legend: {position: 'none'}
             }} />
    </div>
  </div>;
};
