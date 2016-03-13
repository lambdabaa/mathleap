/* @flow */

let KaTeXContainer = require('../KaTeXContainer');
let React = require('react');
let Tabular = require('../Tabular');

function QuestionList(props: Object): React.Element {
  let {responses, num, isSubmissionPending} = props;
  let questions = responses.map((aResponse: Object, index: number) => {
    return [
      <div key={`number-${index}`}
           className="clickable-text"
           style={{fontWeight: 'bold'}}
           onClick={() => props.selectQuestion(index)}>
        {index + 1}
      </div>,
      <KaTeXContainer key={`question-${index}`}
                      style={{cursor: 'pointer'}}
                      onClick={() => props.selectQuestion(index)}
                      ascii={aResponse.question.question} />
    ];
  });

  return <div className="submissions-edit-question-list">
     <Tabular className="dark"
              cols={[
                {content: 'Questions', width: 30},
                {content: '', width: 220}
              ]}
              rows={questions}
              selected={num} />
    {
      isSubmissionPending ?
        <div className="button-inverse button-disabled">Submit</div> :
        <div className="button-inverse" onClick={props.handleSubmit}>Submit</div>
    }
  </div>;
}

module.exports = QuestionList;
