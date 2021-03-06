/* @flow */

let KaTeXContainer = require('../KaTeXContainer');
let React = require('react');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let format = require('../../helpers/format');
let helper = require('../../helpers/submission');

function Show(props: Object): React.Element {
  let {user, headerText, aClass, classId, assignment, isPracticeMode} = props;
  return <div id="submissions-show">
    <Topbar headerText={headerText}
            showModal={props.showModal}
            displayModalError={props.displayModalError}
            displayModalSuccess={props.displayModalSuccess}
            clearMessages={props.clearMessages} />
    <div className="view">
      {
        ((): React.Element => {
          let backlink, backlinkText;
          switch (user.role) {
            case 'student':
              if (isPracticeMode) {
                backlink = `#!/practice/`;
                backlinkText = <span>&lt; Practice sessions</span>;
              } else {
                backlink = `#!/classes/${classId}/`;
                backlinkText = <span>&lt; {aClass && aClass.name}</span>;
              }

              break;
            case 'teacher':
              if (isTestMode(user)) {
                backlink = `#!/classes/${classId}/`;
                backlinkText = <span>&lt; {aClass && aClass.name}</span>;
              } else {
                backlink = `#!/classes/${classId}/assignments/${assignment.id}/`;
                backlinkText = <span>&lt; {assignment && assignment.name}</span>;
              }

              break;
            default:
              throw new Error(`Unexpected user role ${user.role}`);
          }

          return <a className="backlink clickable-text" href={backlink}>
            {backlinkText}
          </a>;
        })()
      }
      <a className="insights-dashboard-link" href={`${location.hash}edit/`}>
        View Submission
      </a>
      <Tabular cols={[
                 {content: '', width: 30},
                 {content: 'Question', width: 250},
                 {content: 'Response', width: 250},
                 {content: 'Answer Key', width: 220},
                 {content: 'Error', width: 250},
                 {content: '', width: 20}
               ]}
               rows={renderResults(props)} />
    </div>
  </div>;
}

function renderResults(props: Object): Array<Array<React.Element | string>> {
  let {responses, marks} = props;
  return responses.map(function(response: Object, index: number): Array<React.Element | string> {
    let {question, work} = response;
    let answer = work[work.length - 1].state[0];
    let correct = marks[index];
    return [
      `${index + 1}.`,
      <KaTeXContainer ascii={question.question} />,
      <KaTeXContainer ascii={answer} />,
      <KaTeXContainer ascii={format.solution(question)} />,
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
    <KaTeXContainer ascii={work[errorLine - 1].state[0]}
                    style={{
                      backgroundColor: 'rgba(176, 235, 63, 0.5)',
                      display: 'inline-block'
                    }} />
    <span style={{margin: '0 5px'}}>→</span>
    <KaTeXContainer ascii={work[errorLine].state[0]}
                    style={{
                      backgroundColor: 'rgba(226, 37, 23, 0.5)',
                      display: 'inline-block'
                    }} />
  </div>;
}

function isTestMode(user: Object): boolean {
  return location.hash.indexOf(user.id) !== -1;
}

module.exports = Show;
