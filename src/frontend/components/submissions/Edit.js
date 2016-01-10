let Firebase = require('firebase/lib/firebase-web');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignments = require('../../store/assignments');
let bridge = require('../../bridge');
let charFromKeyEvent = require('../../charFromKeyEvent');
let classes = require('../../store/classes');
let clone = require('lodash/lang/cloneDeep');
let debug = console.log.bind(console, '[components/submissions/Edit]');
let {firebaseUrl} = require('../../constants');
let includes = require('lodash/collection/includes');
let map = require('lodash/collection/map');
let {mapChar} = require('../../../common/string');
let {someValue} = require('../../../common/array');
let submissions = require('../../store/submissions');
let times = require('lodash/utility/times');

let skipStops = Object.freeze(
  ['=', '>', '≥', '<', '≤', '+', '-', '*', '/', '^']
);

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

module.exports = React.createClass({
  displayName: 'submissions/Edit',

  mixins: [ReactFire],

  getInitialState: function() {
    return {
      aClass: {},
      assignment: {},
      responses: [],
      isHelpDialogShown: false,

      // index of active equation
      num: null,

      // position of cursor in active equation
      cursor: null,

      // boolean array w/ highlight state of active equation characters
      highlight: null,

      // unmodified active equation
      equation: null,

      // string that's being applied to both sides
      append: '',

      // whether append needs to add parens to lh expression
      leftParens: false,

      // whether append needs to add parens to rh expression
      rightParens: false,

      // changes being made in current operation
      deltas: [],

      // array of tokens to represent changes being made to each
      // equation character
      changes: null,

      // bit for cursor blinking
      isCursorVisible: true,

      // stack for undo actions
      undos: [],

      // stack for redo actions
      redos: [],

      // Whether or not the mouse is pressed for highlighting
      isMousePressed: false,

      // Dragged highlight end
      drag: null
    };
  },

  componentWillMount: async function() {
    let {aClass, assignment, submission} = this.props;

    this.bindAsArray(
      new Firebase(`${firebaseUrl}/classes/${aClass}/assignments/${assignment}/submissions/${submission}/responses`),
      'responses'
    );

    let [theClass, theAssignment] = await Promise.all([
      classes.get(aClass),
      assignments.get(aClass, assignment)
    ]);

    this.setState({aClass: theClass, assignment: theAssignment});
    document.addEventListener('keydown', this._handleKeyDown, true);
    document.addEventListener('keypress', preventDefault);
  },

  componentDidMount: function() {
    this.interval = setInterval(this._tick, 1500);
  },

  componentWillUnmount: function() {
    clearInterval(this.interval);
    document.removeEventListener('keydown', this._handleKeyDown, true);
    document.removeEventListener('keypress', preventDefault);
  },

  render: function() {
    let {aClass, assignment, isHelpDialogShown} = this.state;
    return <div id="submissions-edit">
      <Topbar headerText={assignment.name || ''} />
      <div className="view">
        <div className="backlink clickable-text" onClick={this._handleBack}>
          &lt; {aClass && aClass.name}
        </div>
        <div className="submissions-edit-workspace">
          {this._renderQuestionList()}
          {this._renderQuestion()}
          {isHelpDialogShown && this._renderHelpDialog()}
          <img className="submissions-edit-help-button"
               src="style/images/question-mark.png"
               onClick={this._showHelpDialog} />
        </div>
      </div>
    </div>;
  },

  _tick: function() {
    this.setState({isCursorVisible: !this.state.isCursorVisible});
  },

  _renderQuestionList: function() {
    let {responses, num} = this.state;
    let questions = responses.map((aResponse, index) => {
      return [
        <div key={`number-${index}`}
             className="clickable-text"
             style={{fontWeight: 'bold'}}
             onClick={this._selectQuestion.bind(this, index)}>
          {index + 1}
        </div>,
        <div key={`question-${index}`}
             className="clickable-text"
             onClick={this._selectQuestion.bind(this, index)}>
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
      <div className="button-inverse" onClick={this._handleSubmit}>Submit</div>
    </div>;
  },

  _renderQuestion: function() {
    let {responses, num, equation, append, cursor, leftParens, rightParens} = this.state;
    let rows = [];
    let response = responses[num];
    if (response) {
      let {work} = response;
      rows = work.map((step, index) => {
        // We need a special case for the last row since we need
        // to apply the outstanding (uncommitted) changes.
        if (index === work.length - 1) {
          return [
            this._renderChanges(step.state[0], this.state.changes, append, leftParens, rightParens),
            this._renderResults(equation, cursor, append, leftParens, rightParens)
          ];
        }

        let next = work[index + 1];
        return [
          this._renderChanges(
            step.state[0],
            step.changes[0],
            step.appends ? step.appends[0] : ''
          ),
          this._renderResults(next.state[0])
        ];
      });
    }

    return <Tabular className="dark"
                    cols={[
                      {content: 'Action', width: 325},
                      {content: 'Results (select and edit here)', width: 325}
                    ]}
                    rows={rows} />;
  },

  _renderChanges: function(equation, changes, append = '', leftParens = false, rightParens = false) {
    return <div className="submissions-edit-active">
      {
        (() => {
          function renderEquationChar(chr, index) {
            let style = {};
            // TODO(gaye): Need to handle non-equality statements...
            let changeIndex = index >= equation.indexOf('=') ?
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

          let [left, right] = equation.split('=');
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
              [renderEquationChar('=', left.length + append.length)]
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
  },

  _renderResults: function(equation, cursor, append = '', leftParens = false, rightParens = false) {
    // The way we've patched rendering for https://github.com/gaye/ml/issues/71 here is pretty cute
    // and confusing. This will get cleaned up but in the meantime beware!
    if (typeof cursor !== 'number') {
      return equation;
    }

    let {isCursorVisible} = this.state;
    let [left, right] = equation.split('=');
    let highlight = this._applyDragToHighlight();

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
          leftParens && <div key="leftp1" className="submissions-edit-character unselectable">)</div>,
          result
        ];
      }

      if (index === left.length + append.length) {
        return [
          result,
          rightParens && <div key="rightp1" className="submissions-edit-character unselectable">)</div>
        ];
      }

      return result;
    }

    return <div key={JSON.stringify({equation, cursor})}
                className="submissions-edit-active"
                onMouseDown={this._handleCursorReposition}
                onMouseMove={this._stageCursorHighlight}
                onMouseUp={this._commitCursorHighlight}>
      {
        leftParens &&
        <div key="leftp0" className="submissions-edit-character unselectable">(</div>
      }
      {times(cursor, renderChar)}
      {isCursorVisible && <div className="submissions-edit-cursor unselectable">|</div>}
      {times(equation.length + 2 * append.length - cursor + 1, i => renderChar(cursor + i))}
      {
        rightParens &&
        <div key="rightp1" className="submissions-edit-character unselectable">)</div>
      }
    </div>;
  },

  _renderHelpDialog: function() {
    return <div className="submissions-edit-help-dialog"
         onClick={event => event.stopPropagation()}>
      <div className="tabular-header">Hotkeys</div>
      <div className="modal-exit" onClick={this._hideHelpDialog}>x</div>
      <div className="submissions-edit-help-dialog-contents">
        <div className="submissions-edit-help-dialog-col">
          <div className="submissions-edit-help-dialog-label">Navigation</div>
          {map(navigationHotkeys, this._renderHotkey)}
        </div>

        <div className="submissions-edit-help-dialog-col">
          <div className="submissions-edit-help-dialog-label">Actions</div>
          {map(actionHotkeys, this._renderHotkey)}
        </div>
      </div>
    </div>;
  },

  _renderHotkey: function(explanation, shortcut) {
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
  },

  _selectQuestion: function(num) {
    let {responses} = this.state;
    let {work} = responses[num];
    let equation = work[work.length - 1].state[0];
    this.setState({
      num,
      equation,
      append: '',
      leftParens: false,
      rightParens: false,
      changes: mapChar(equation, () => 'none'),
      highlight: mapChar(equation, () => false),
      cursor: equation.length,
      deltas: [],
      undos: [],
      redos: []
    });
  },

  _handleKeyDown: function(event) {
    if (event.keyCode === 8) {
      event.preventDefault();
    }

    let {num} = this.state;
    if (typeof num !== 'number') {
      return;
    }

    return this._handleKeyEvent(event);
  },

  _handleKeyEvent: function(event) {
    if (event.shiftKey) {
      return this._handleShiftKey(event);
    }

    if (event.ctrlKey || event.metaKey) {
      return this._handleCtrlKey(event);
    }

    return this._handleNoModifierKey(event);
  },

  _handleNoModifierKey: function(event) {
    let {equation, cursor} = this.state;
    switch (event.keyCode) {
      case 37:
        event.preventDefault();
        cursor = Math.max(0, cursor - 1);
        return this.setState({cursor, isCursorVisible: true});
      case 39:
        event.preventDefault();
        cursor = Math.min(equation.length, cursor + 1);
        return this.setState({cursor, isCursorVisible: true});
      default:
        return this._handleDelta(event);
    }
  },

  _handleShiftKey: function(event) {
    let {cursor, equation, highlight} = this.state;
    switch (event.keyCode) {
      case 37:
        event.preventDefault();
        if (cursor === 0) {
          return;
        }

        cursor = Math.max(cursor - 1);
        highlight[cursor] = !highlight[cursor];
        return this.setState({cursor, highlight, isCursorVisible: true});
      case 39:
        event.preventDefault();
        if (cursor === equation.length) {
          return;
        }

        highlight[cursor] = !highlight[cursor];
        cursor = Math.max(cursor + 1);
        return this.setState({cursor, highlight, isCursorVisible: true});
      case 90:
        if (event.ctrlKey) {
          return this._handleRedo();
        }
      default:
        this._handleDelta(event);
    }
  },

  _handleCtrlKey: function(event) {
    let {responses, num, cursor, equation} = this.state;
    switch (event.keyCode) {
      case 37:  // left
        event.preventDefault();
        if (cursor === 0) {
          return;
        }

        do {
          cursor -= 1;
          let chr = equation.charAt(cursor);
          if (includes(skipStops, chr)) {
            break;
          }
        } while (cursor > 0);

        return this.setState({cursor, isCursorVisible: true});
      case 39:  // right
        event.preventDefault();
        if (cursor === equation.length) {
          return;
        }

        do {
          cursor += 1;
          let chr = equation.charAt(cursor);
          if (includes(skipStops, chr)) {
            break;
          }
        } while (cursor < equation.length);

        return this.setState({cursor, isCursorVisible: true});
      case 65:  // a
        event.preventDefault();
        return this.setState({cursor: 0});
      case 68:  // d
        event.preventDefault();
        return this._selectQuestion((num + 1) % responses.length);
      case 69:  // e
        event.preventDefault();
        return this.setState({cursor: equation.length});
      case 85:  // u
        event.preventDefault();
        return this._selectQuestion(num === 0 ? responses.length - 1 : num - 1);
      case 90:  // z
        event.preventDefault();
        return this._handleUndo();
      default:
        debug(`Unknown control sequence ${event.keyCode}`);
    }
  },

  _handleDelta: function(event) {
    debug('delta', event);
    if (event.keyCode === 13) {
      return this._commitDelta();
    }

    let chr = charFromKeyEvent(event);
    if (event.keyCode !== 8 && !chr) {
      return debug('Did not process delta on key event', event);
    }

    let highlights = this._getHighlights();
    return highlights.length ?
      this._handleSelections(event, highlights) :
      this._handleChar(event);
  },

  _handleChar: function(event) {
    let {deltas, append} = this.state;
    if (append.length) {
      return this._handleBothSidesChar(event);
    }

    if (!deltas.length) {
      return event.keyCode === 8 ?
        this._handleBackspace(event) :
        this._handleFirstChar(event);
    }

    // In this case the previous delta was a cancel or replace.
    if (event.keyCode === 8) {
      return this._handleBackspace(event);
    }

    debug('extend replace');
    let {cursor} = this.state;
    let chr = charFromKeyEvent(event);
    if (!chr) {
      return;
    }

    return this._appendDelta(
      {type: 'replace', range: [cursor, cursor], replacement: chr},
      cursor + 1
    );
  },

  _handleBackspace: function(event) {
    debug('handle backspace');
    let {cursor} = this.state;
    if (cursor === 0) {
      debug('Can\'t backspace at 0.');
      return;
    }

    event.preventDefault();
    return this._appendDelta(
      {type: 'cancel', range: [cursor, cursor]},
      cursor - 1
    );
  },

  /**
   * Nothing has been done in the current step and the student
   * entered some character.
   */
  _handleFirstChar: async function(event) {
    event.preventDefault();
    event.stopPropagation();

    let operator;
    switch (event.keyCode) {
      case 54:
        if (event.shiftKey) { operator = '^'; }
        break;
      case 56:
        if (event.shiftKey) { operator = '*'; }
        break;
      case 61:
      case 187:
        if (event.shiftKey) { operator = '+'; }
        break;
      case 173:
      case 179:
      case 189:
        operator = '-';
        break;
      case 191:
        operator = '/';
        break;
      default:
        break;
    }

    debug('handle first char', operator);

    if (!operator) {
      debug('random characters typed...?');
      return;
    }

    let {equation, cursor} = this.state;
    let split = equation.indexOf('=');
    if (cursor <= split) {
      cursor = split + 1;
    } else {
      cursor = equation.length + 2;
    }

    let [leftParens, rightParens] = await Promise.all(
      equation.split('=').map(async (expression) => {
        let expressionPriority = await bridge('getPriority', expression);
        let operatorPriority = getOperatorPriority(operator);
        return operatorPriority > expressionPriority;
      })
    );

    this._saveState();
    this.setState({append: operator, cursor, leftParens, rightParens});
  },

  _handleBothSidesChar: function(event) {
    debug('handle both sides char');
    let {append, cursor, equation, leftParens, rightParens} = this.state;

    let offset;
    let split = equation.indexOf('=');
    if (cursor <= split + append.length) {
      cursor = split + append.length;
      offset = 1;
    } else {
      cursor = equation.length + 2 * append.length;
      offset = 2;
    }

    if (event.keyCode === 8) {
      append = append.slice(0, append.length - 1);
      cursor -= offset;
      if (!append.length) {
        leftParens = false;
        rightParens = false;
      }
    } else {
      let chr = charFromKeyEvent(event);
      if (!chr) {
        return debug('Unable to resolve character from key event');
      }

      append += chr;
      cursor += offset;
    }

    event.preventDefault();
    this._saveState();
    this.setState({append, cursor, leftParens, rightParens});
  },

  _handleSelections: async function(event, highlights) {
    let {cursor} = this.state;
    highlights.reverse();
    for (let i = 0; i < highlights.length; i++) {
      let highlight = highlights[i];
      let {start, end} = highlight;
      await this._handleSelection(
        cursor >= start && cursor <= end + 1 ?
          event :
          {keyCode: 8, preventDefault: () => {}},
        start,
        end
      );
    }
  },

  _handleSelection: function(event, start, end) {
    debug('handle selection', JSON.stringify(arguments));
    let args;
    if (event.keyCode === 8) {
      // TODO(gaye): Temporary workaround for
      //     https://github.com/gaye/ml/issues/79
      if (start === end) {
        args = [
          {type: 'cancel', range: [start + 1 , end + 1]},
          start
        ];
      } else {
        args = [
          {type: 'cancel', range: [start, end]},
          start
        ];
      }
    } else {
      let chr = charFromKeyEvent(event);
      if (!chr) {
        return debug('Unable to resolve character from key event');
      }

      args = [
        {type: 'replace', range: [start, end], replacement: chr},
        start + 1
      ];
    }

    event.preventDefault();
    return this._appendDelta(...args);
  },

  _handleUndo: async function() {
    debug('handle undo');
    let {undos, redos} = this.state;
    if (undos.length) {
      let next = undos.pop();
      redos.push(this.state);
      next.undos = undos;
      next.redos = redos;
      return this.replaceState(next);
    }

    let {aClass, assignment, submission} = this.props;
    let {responses, num} = this.state;
    let {work} = responses[num];
    this.setState({redos: []});
    await submissions.popDelta(aClass, assignment, submission, num, work);
    this._selectQuestion(num);
  },

  _handleRedo: async function() {
    debug('handle redo');
    let {undos, redos} = this.state;
    if (!redos.length) {
      return debug('no undos to redo!');
    }

    let next = redos.pop();
    undos.push(this.state);
    next.undos = undos;
    next.redos = redos;
    this.replaceState(next);
  },

  _saveState: function() {
    let state = clone(this.state);
    let undos = state.undos.concat(state);
    this.setState({undos, redos: []});
  },

  _getHighlights: function() {
    let result = [];
    // The goal here is to find the maximal contiguous highlights.
    let {highlight} = this.state;
    let start = null;
    for (let i = 0; i < highlight.length; i++) {
      if (start === null) {
        // Possibly block start
        start = highlight[i] ? i : null;
        continue;
      }

      if (!highlight[i]) {
        // End of block
        result.push({start, end: i - 1});
        start = null;
        continue;
      }

      // Still in a block...
    }

    // Check to make sure we didn't end on a highlight.
    if (start !== null) {
      result.push({start, end: highlight.length - 1});
    }

    return result;
  },

  _appendDelta: async function(delta, cursor) {
    debug('appendDelta', JSON.stringify(arguments));
    if (!delta) {
      return;
    }

    if ('replacement' in delta) {
      let {replacement} = delta;
      if (!/^[a-zA-Z0-9\+\-\*\/\^\)\(]+$/.test(replacement)) {
        debug(`Invalid input character: ${replacement}`);
        return;
      }
    }

    this._saveState();
    let {responses, num, deltas} = this.state;
    let {work} = responses[num];
    let {state} = work[work.length - 1];
    deltas.push(delta);
    let {result, changes} = await bridge('diff', state[0], deltas);
    // Clear highlight.
    this.setState({
      deltas: deltas,
      equation: result,
      changes,
      cursor,
      highlight: mapChar(result, () => false)
    });
  },

  _commitDelta: async function() {
    let {aClass, assignment, submission} = this.props;
    let {responses, num, changes, equation, append, leftParens, rightParens} = this.state;
    let {work} = responses[num];
    let [left, right] = equation.split('=');
    let result = right ?
      `${leftParens ? '(' : ''}${left}${leftParens ? ')' : ''}${append}=${rightParens ? '(' : ''}${right}${rightParens ? ')' : ''}${append}` :
      left;

    await submissions.commitDelta(
      aClass,
      assignment,
      submission,
      num,
      work,
      [changes],
      [append],
      [result]
    );

    // This will reset all of our work on the current state.
    this._selectQuestion(num);
  },

  _handleSubmit: async function() {
    debug('submit assignment');
    let {aClass, assignment, submission} = this.props;
    await submissions.submit(aClass, assignment, submission);
    location.hash = `#!/classes/${aClass}/assignments/${assignment}/submissions/${submission}`;
  },

  _handleCursorReposition: function(event) {
    debug('cursor reposition', event);
    event.stopPropagation();
    this.setState({
      cursor: eventToCursorPosition(event),
      isCursorVisible: true,
      isMousePressed: true
    });
  },

  _stageCursorHighlight: function(event) {
    event.stopPropagation();

    let {cursor, isMousePressed} = this.state;
    if (!isMousePressed) {
      return;
    }

    this.setState({drag: eventToCursorPosition(event)});
  },

  _commitCursorHighlight: function(event) {
    debug('commit cursor highlight', event);
    event.stopPropagation();
    this.setState({
      highlight: this._applyDragToHighlight(),
      isMousePressed: false,
      drag: null
    });
  },

  _applyDragToHighlight: function() {
    let {highlight, cursor, drag} = this.state;
    return highlight.map((value, index) => {
      return drag === null ||
             index > cursor - 1 && index > drag ||
             index < cursor && index < drag ?
        value :
        !value;
    });
  },

  _showHelpDialog: function() {
    debug('Show help dialog');
    this.setState({isHelpDialogShown: true});
  },

  _hideHelpDialog: function() {
    debug('Hide help dialog');
    this.setState({isHelpDialogShown: false});
  },

  _handleBack: function() {
    location.hash = `#!/classes/${this.props.aClass}/`;
  }
});

function eventToCursorPosition(event) {
  let element = event.target;
  while (!element.classList.contains('submissions-edit-active')) {
    element = element.parentNode;
  }

  let rect = element.getBoundingClientRect();
  let eventX = event.clientX - rect.left;

  let children = Array.from(
    element.getElementsByClassName('submissions-edit-character')
  );

  let pos = someValue(children, (childNode, index) => {
    let childRect = childNode.getBoundingClientRect();
    let childLeft = childRect.left - rect.left;
    let childRight = childRect.right - rect.left;
    if (childRight >= eventX) {
      // Choose whichever of left side and right side of character
      // is closer to the event.
      let leftDist = Math.abs(childLeft - eventX);
      let rightDist = Math.abs(childRight - eventX);
      return leftDist < rightDist ? index : index + 1;
    }
  });

  return typeof pos === 'number' ? pos : children.length;
}

function getOperatorPriority(operator) {
  switch (operator) {
    case '+':
    case '-':
      return 0;
    case '*':
      return 1;
    case '/':
      return 2;
    case '^':
      return 3;
    default:
      throw new Error(`Unexpected operator ${operator}`);
  }
}

function preventDefault(event) {
  event.preventDefault();
}
