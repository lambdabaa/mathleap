/* @flow */

let React = require('react');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let helper = require('../../helpers/submission');

module.exports = function(props: Object): React.Element {
  let {user, headerText, aClass, classId, assignment, isPracticeMode} = props;
  return <div id="submissions-show">
    <Topbar headerText={headerText} />
    <div className="view">
      {
        ((): React.Element => {
          switch (user.role) {
            case 'student':
              let backlink, backlinkText;
              if (isPracticeMode) {
                backlink = `#!/practice/`;
                backlinkText = <span>&lt; Practice sessions</span>;
              } else {
                backlink = `#!/classes/${classId}/`;
                backlinkText = <span>&lt; {aClass && aClass.name}</span>;
              }

              return <a className="backlink clickable-text" href={backlink}>{backlinkText}</a>;
            case 'teacher':
              return <a className="backlink clickable-text"
                        href={`#!/classes/${classId}/assignments/${assignment.id}/`}>
                &lt; {assignment && assignment.name}
              </a>;
            default:
              throw new Error(`Unexpected user role ${user.role}`);
          }
        })()
      }
      <Tabular cols={[
                 {content: '', width: 40},
                 {content: 'Question', width: 300},
                 'Response',
                 'Answer Key',
                 {content: 'Error', width: 325},
                 {content: 'Result', width: 40}
               ]}
               rows={renderResults(props)} />
    </div>
  </div>;
};

function renderResults(props: Object): Array<Array<React.Element | string>> {
  let {responses, marks} = props;
  return responses.map(function(response: Object, index: number): Array<React.Element | string> {
    let {question, work} = response;
    let answer = work[work.length - 1].state[0];
    let correct = marks[index];
    return [
      `${index + 1}.`,
      question.question,
      answer,
      question.solution,
      correct ? <div></div> : renderError(response),
      correct ?
        <div style={{color: '#71ac00'}}>✔</div> :
        <div style={{color: '#e22517'}}>✗</div>
    ];
  });
}

function renderError(response: Object): React.Element {
  let {work} = response;
  let errorLine = helper.getErrorLine(response);
  if (errorLine === -1 || work.length < 2) {
    return <div>Incomplete: Answer can be simplified</div>;
  }

  return <div>
    <span>Step: </span>
    <span style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
      {work[errorLine - 1].state[0]}
    </span>
    <span>→</span>
    <span style={{backgroundColor: 'rgba(226, 37, 23, 0.5)'}}>
      {work[errorLine].state[0]}
    </span>
  </div>;
}
