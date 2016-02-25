/* @flow */

let React = require('react');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let TutorialContainer = require('./TutorialContainer');
let editor = require('../../helpers/editor');
let {isEditorSupported} = require('../../isBrowserSupported');
let map = require('lodash/collection/map');
let {mapChar} = require('../../../common/string');
let stmt = require('../../../common/stmt');
let stringify = require('../../../common/stringify');
let times = require('lodash/utility/times');

let navigationHotkeys = Object.freeze({
  'ctrl a': 'Move cursor to beginning of active equation',
  'ctrl e': 'Move cursor to end of active equation',
  'ctrl →': 'Move cursor one term right',
  'ctrl ←': 'Move cursor one term left',
  'ctrl u': 'Open the previous problem',
  'ctrl d': 'Open the next problem'
});

let actionHotkeys = Object.freeze({
  'shift →': 'Highlight a character to the right',
  'shift ←': 'Highlight a character to the left',
  'enter': 'Commit the changes in the current step',
  'ctrl z': 'Undo',
  'ctrl shift z': 'Redo'
});

module.exports = function(props: Object): React.Element {
  let {
    aClass,
    classId,
    assignment,
    num,
    isHelpDialogShown,
    isTutorialDismissed,
    isPracticeMode
  } = props;

  let headerText, backlink, backlinkText;
  if (isPracticeMode) {
    headerText = 'Practice Mode';
    backlink = '#!/practice/';
    backlinkText = <span>&lt; Practice sessions</span>;
  } else {
    headerText = assignment.name || '';
    backlink = `#!/classes/${classId}/`;
    backlinkText = <span>&lt; {aClass && aClass.name}</span>;
  }

  return <div id="submissions-edit">
    {
      isEditorSupported() ?
        '' :
        <div className="service-outage">
          Solving problems in this browser not supported. Please use an
          up-to-date version of a desktop browser like
          <a href="https://mozilla.org/firefox/">Firefox</a>.
        </div>
    }
    <Topbar headerText={headerText} />
    <div className="view">
      <div className="subbar">
        <a className="backlink clickable-text" href={backlink}>{backlinkText}</a>
        <div className="question-instruction">
          {editor.getInstruction(assignment, num)}
        </div>
      </div>
      <div className="submissions-edit-workspace">
        {renderQuestionList(props)}
        {renderQuestion(props)}
        {isHelpDialogShown && renderHelpDialog(props)}
        <img className="submissions-edit-help-button"
             src="public/style/images/question-mark.png"
             onClick={props.showHelpDialog} />
      </div>
      <div className="tutorial-buffer"></div>
    </div>
    {
      isTutorialDismissed ?
        '' :
        <TutorialContainer dismiss={props.dismissTutorial} />
    }
  </div>;
};

function renderQuestionList(props: Object): Array<Array<React.Element>> {
  let {responses, num, isSubmissionPending} = props;
  let questions = responses.map((aResponse: Object, index: number) => {
    return [
      <div key={`number-${index}`}
           className="clickable-text"
           style={{fontWeight: 'bold'}}
           onClick={() => props.selectQuestion(index)}>
        {index + 1}
      </div>,
      <div key={`question-${index}`}
           className="clickable-text"
           onClick={() => props.selectQuestion(index)}>
        {aResponse.question.question}
      </div>
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

function renderQuestion(props: Object): Array<Array<React.Element>> {
  let {responses, num, equation, append, cursor, leftParens, rightParens} = props;
  let rows = [];
  let response = responses[num];
  if (response) {
    let {work} = response;
    rows = work.map((step: Object, index: number): Array<React.Element> => {
      // We need a special case for the last row since we need
      // to apply the outstanding (uncommitted) changes.
      if (index === work.length - 1) {
        return [
          renderChanges(props, step.state[0], props.changes, append, leftParens, rightParens),
          renderResults(props, equation, cursor, append, leftParens, rightParens)
        ];
      }

      let next = work[index + 1];
      return [
        renderChanges(
          props,
          step.state[0],
          step.changes[0],
          step.appends ? step.appends[0] : ''
        ),
        renderResults(props, next.state[0])
      ];
    });
  }

  return <div className="submissions-edit-question">
    <Tabular className="dark"
             cols={[
               {content: 'History', width: 325},
               {content: 'Results (select and edit here)', width: 325}
             ]}
             rows={rows} />;
    <div className="next-and-previous">
      <div className="button" onClick={props.prevQuestion}>Previous</div>
      <div className="button-inverse" onClick={props.nextQuestion}>Next</div>
    </div>
  </div>;
}

function renderChanges(props, equation, changes, append = '', leftParens = false,
                       rightParens = false): React.Element {
  let symbol = stmt.getStmtSymbol(equation) || '=';
  return <div className="submissions-edit-changes unselectable">
    {
      (() => {
        function renderEquationChar(chr, index) {
          let style = {};
          // TODO(gaye): Need to handle non-equality statements...
          let changeIndex = index >= equation.indexOf(symbol) ?
            index - append.length :
            index;
          let change = changes[changeIndex];
          switch (change) {
            case 'highlight':
              style.backgroundColor = 'rgba(57, 150, 240, 0.5)';
              break;
            case 'strikethrough':
              style.backgroundColor = 'rgba(226, 37, 23, 0.5)';
              break;
            case 'none':
              break;
            default:
              throw new Error(`Unexpected change token ${change}`);
          }

          return <div key={index} style={style}>
            <span style={{color: 'black'}}>{chr}</span>
          </div>;
        }

        function renderAppendChar(chr, index) {
          return <div key={index}
                      style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
            <span style={{color: 'black'}}>{chr}</span>
          </div>;
        }

        let [left, right] = equation.split(symbol);
        if (!right) {
          // TODO(gaye): This is still ignoring statements other
          //     than equality.
          // This is just an expression (e.g. arithmetic problem)
          return mapChar(left, renderEquationChar);
        }

        if (equation.length > changes.length) {
          // Ahhh? This is a workaround for an issue
          // I don't totally understand. Sometimes we get changes
          // for an equation with both sides applied and the equation
          // has both sides applied. We should make sure to remove
          // the append from the equation in this case.
          left = left.slice(0, left.length - append.length);
          right = right.slice(0, right.length - append.length);
        }

        return [
            leftParens &&
            <div key="leftp0"
                 style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
              <span style={{color: 'black'}}>(</span>
            </div>
          ].concat(
            mapChar(left, renderEquationChar)
          )
          .concat(
            leftParens &&
            <div key="leftp1"
                 style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
              <span style={{color: 'black'}}>)</span>
            </div>
          )
          .concat(
            mapChar(append, (chr, index) => {
              return renderAppendChar(chr, index + left.length);
            })
          )
          .concat(
            [renderEquationChar(symbol, left.length + append.length)]
          )
          .concat(
            rightParens &&
            <div key="rightp0"
                 style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
              <span style={{color: 'black'}}>(</span>
            </div>
          )
          .concat(
            mapChar(right, (chr, index) => {
              return renderEquationChar(
                chr,
                index + left.length + append.length + 1
              );
            })
          )
          .concat(
            rightParens &&
            <div key="rightp1"
                 style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
              <span style={{color: 'black'}}>)</span>
            </div>
          )
          .concat(
            mapChar(append, (chr, index) => {
              return renderAppendChar(
                chr,
                index + left.length + append.length + 1 + right.length
              );
            })
          );
      })()
    }
  </div>;
}

function renderResults(props, equation, cursor, append = '', leftParens = false,
                       rightParens = false): React.Element {
  // The way we've patched rendering for https://github.com/gaye/ml/issues/71 here is pretty cute
  // and confusing. This will get cleaned up but in the meantime beware!
  if (typeof cursor !== 'number') {
    return <div className="unselectable">{equation}</div>;
  }

  let {highlight, drag, isCursorVisible} = props;
  let {left, right} = stmt.getLeftAndRight(equation);
  highlight = editor.applyDragToHighlight(highlight, cursor, drag);

  function renderChar(index) {
    let style = {};
    let chr;
    if (index < left.length ||
        index >= left.length + append.length &&
        index < equation.length + append.length) {
      // equation proper
      if (highlight && highlight[index]) {
        style.backgroundColor = 'rgba(57, 150, 240, 0.5)';
      }

      chr = index < left.length ?
        equation.charAt(index) :
        equation.charAt(index - append.length);
    } else {
      // append
      chr = index < left.length + append.length ?
        append.charAt(index - left.length) :
        append.charAt(index - equation.length - append.length);
    }

    let result = <div key={index}
                      className="submissions-edit-character unselectable"
                      style={style}>
      {chr}
    </div>;

    if (index === left.length) {
      return [
        leftParens &&
        <div key="leftp1" className="submissions-edit-character unselectable">)</div>,
        result
      ];
    }

    if (index === left.length + append.length) {
      return [
        result,
        rightParens &&
        <div key="rightp0" className="submissions-edit-character unselectable">(</div>
      ];
    }

    if (right && index === left.length + append.length + 1 + right.length) {
      return [
        rightParens &&
        <div key="rightp1" className="submissions-edit-character unselectable">)</div>,
        result
      ];
    }

    return result;
  }

  if (!right) {
    return <div key={stringify({equation, cursor})}
                className="submissions-edit-active"
                onMouseDown={props.repositionCursor}
                onMouseMove={props.stageCursorHighlight}
                onMouseUp={props.commitCursorHighlight}>
      {times(cursor, renderChar)}
      {isCursorVisible && <div className="submissions-edit-cursor unselectable"></div>}
      {times(equation.length - cursor + 1, i => renderChar(cursor + i))}
    </div>;
  }

  return <div key={stringify({equation, cursor})}
              className="submissions-edit-active"
              onMouseDown={props.repositionCursor}
              onMouseMove={props.stageCursorHighlight}
              onMouseUp={props.commitCursorHighlight}>
    {
      leftParens &&
      <div key="leftp0" className="submissions-edit-character unselectable">(</div>
    }
    {times(cursor, renderChar)}
    {isCursorVisible && <div className="submissions-edit-cursor unselectable"></div>}
    {times(equation.length + 2 * append.length - cursor + 1, i => renderChar(cursor + i))}
  </div>;
}

function renderHelpDialog(props: Object): React.Element {
  return <div className="submissions-edit-help-dialog"
       onClick={event => event.stopPropagation()}>
    <div className="tabular-header">Hotkeys</div>
    <div className="modal-exit" onClick={props.hideHelpDialog}>x</div>
    <div className="submissions-edit-help-dialog-contents">
      <div className="submissions-edit-help-dialog-col">
        <div className="submissions-edit-help-dialog-label">Navigation</div>
        {map(navigationHotkeys, renderHotkey)}
      </div>

      <div className="submissions-edit-help-dialog-col">
        <div className="submissions-edit-help-dialog-label">Actions</div>
        {map(actionHotkeys, renderHotkey)}
      </div>
    </div>
  </div>;
}

function renderHotkey(explanation: string, shortcut: string): React.Element {
  return <div className="submissions-edit-help-dialog-shortcut">
    <div className="submissions-edit-help-dialog-keycode-container">
      <div className="submissions-edit-help-dialog-keycode">
        {shortcut}
      </div>
    </div>
    <div className="submissions-edit-help-dialog-explanation">
      {explanation}
    </div>
  </div>;
}
