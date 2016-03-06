/* @flow */

let EquationEditor = require('./EquationEditor');
let QuestionList = require('./QuestionList');
let React = require('react');
let TextInputResponse = require('./TextInputResponse');
let Topbar = require('../Topbar');
let TutorialContainer = require('./TutorialContainer');
let editor = require('../../helpers/editor');
let {isEditorSupported} = require('../../isBrowserSupported');
let map = require('lodash/collection/map');

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
    questionType,
    isHelpDialogShown,
    isTutorialDismissed,
    isPractice
  } = props;

  let headerText, backlink, backlinkText;
  if (isPractice) {
    headerText = 'Practice Mode';
    backlink = '#!/practice/';
    backlinkText = '< Practice sessions';
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
        {React.createElement(QuestionList, props)}
        {
          (() => {
            let ctor;
            switch (questionType) {
              case 'equation-editor':
                ctor = EquationEditor;
                break;
              case 'text-input-response':
                ctor = TextInputResponse;
                break;
            }

            return React.createElement(ctor, props);
          })()
        }
        {isHelpDialogShown && renderHelpDialog(props)}
        {
          questionType === 'equation-editor' ?
            <img className="submissions-edit-help-button"
                 src="public/style/images/question-mark.png"
                 onClick={props.showHelpDialog} /> :
            ''
        }
      </div>
      <div className="tutorial-buffer"></div>
    </div>
    {
      questionType === 'equation-editor' && !isTutorialDismissed ?
        <TutorialContainer dismiss={props.dismissTutorial} /> :
        ''
    }
  </div>;
};

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
