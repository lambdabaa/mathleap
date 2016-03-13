/* @flow */

let {Chart} = require('react-google-charts');
let KaTeXContainer = require('../KaTeXContainer');
let Message = require('../Message');
let React = require('react');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let countBy = require('lodash/collection/countBy');
let map = require('lodash/collection/map');
let redToGreen = require('../../redToGreen');
let round = require('../../round');

function Insights(props: Object): React.Element {
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
    <Topbar headerText={`${theAssignment.name || ''} Performance`}
            showModal={props.showModal}
            displayModalError={props.displayModalError}
            displayModalSuccess={props.displayModalSuccess}
            clearMessages={props.clearMessages} />
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
      <Tabular cols={['Question', 'Percentage Correct']}
               rows={renderQuestionToCorrect(props)} />
    </div>
  </div>;
}

function renderQuestionToCorrect(props: Object): Array<Array<React.Element | string>> {
  let {questionToCorrect, theAssignment} = props;
  return map(
    questionToCorrect,
    (correct: number, question: string): Array<React.Element | string> => {
      let index = parseInt(question);
      let percentage = `${round(100 * correct)}%`;
      let style = {
        backgroundColor: redToGreen(correct),
        width: percentage
      };

      return [
        <div className="insights-question">
          <div className="insights-question-index">{index + 1}</div>
          <KaTeXContainer ascii={theAssignment.questions[index].question} />
        </div>,
        <div className="insights-percentage" style={style}>{percentage}</div>
      ];
    }
  );
}

module.exports = Insights;
