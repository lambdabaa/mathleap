/* @flow */

let $ = document.querySelector.bind(document);
let Edit = require('./Edit');
let React = require('react');
let ReactFire = require('reactfire');
let assignments = require('../../store/assignments');
let bridge = require('../../bridge');
let charFromKeyEvent = require('../../charFromKeyEvent');
let classes = require('../../store/classes');
let clone = require('lodash/lang/cloneDeep');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');
let debug = require('../../../common/debug')('components/submissions/Edit');
let editor = require('../../helpers/editor');
let isElementVisible = require('../../isElementVisible');
let {mapChar} = require('../../../common/string');
let preventDefault = require('../../preventDefault');
let session = require('../../session');
let stringify = require('../../../common/stringify');
let submissions = require('../../store/submissions');

import type {KeyboardEvent, Range} from '../../../common/types';

module.exports = React.createClass({
  displayName: 'submissions/Edit',

  mixins: [ReactFire],

  getInitialState: function(): Object {
    return {
      aClass: {},
      assignment: {},
      responses: [],

      // Whether the keyboard shortcuts are shown.
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
      drag: null,

      // Whether user dismissed tutorial
      isTutorialDismissed: false,

      // Whether we're waiting for a submit action
      isSubmissionPending: false
    };
  },

  // $FlowFixMe
  componentWillMount: async function(): Promise<void> {
    let {aClass, assignment, submission, id} = this.props;

    if (aClass) {
      // $FlowFixMe
      this.isPracticeMode = false;
      this.bindAsArray(
        createSafeFirebaseRef(`classes/${aClass}/assignments/${assignment}/submissions/${submission}/responses`),
        'responses'
      );

      let [theClass, theAssignment] = await Promise.all([
        classes.get(aClass),
        assignments.get(aClass, assignment)
      ]);

      this.setState({aClass: theClass, assignment: theAssignment});
    } else if (id) {
      // $FlowFixMe
      this.isPracticeMode = true;
      let user = session.get('user');
      this.bindAsArray(
        createSafeFirebaseRef(`students/${user.id}/assignments/${id}/submission/responses`),
        'responses'
      );

      let theAssignment = await assignments.getPractice(id);
      this.setState({assignment: theAssignment});
    } else {
      throw new Error('Nowhere to find responses!');
    }

    // $FlowFixMe
    document.addEventListener('keydown', this._handleKeyDown, true);
    document.addEventListener('keypress', preventDefault);
  },

  componentDidMount: function(): void {
    // $FlowFixMe
    this.interval = setInterval(this._tick, 1500);
    // $FlowFixMe
    this.isBusy = false;

    // Scroll the tutorial into view
    let tutorial = $('.submissions-edit-tutorial');
    if (tutorial) {
      tutorial.scrollIntoView();
    }
  },

  componentWillUnmount: function(): void {
    clearInterval(this.interval);
    // $FlowFixMe
    document.removeEventListener('keydown', this._handleKeyDown, true);
    document.removeEventListener('keypress', preventDefault);
  },

  componentDidUpdate: function(): void {
    if (this.didCommitDelta) {
      // Make sure that the latest step is scrolled into view.
      // $FlowFixMe
      this.didCommitDelta = false;
      let step = $('.submissions-edit-question .tabular-row:last-child');
      if (step && !isElementVisible(step)) {
        step.scrollIntoView();
      }
    }

    if (this.didSelectQuestion) {
      // Make sure selected question is scrolled into view.
      // $FlowFixMe
      this.didSelectQuestion = false;
      let question = $('.submissions-edit-question-list .tabular-row.selected');
      if (question && !isElementVisible(question)) {
        question.scrollIntoView();
      }
    }
  },

  _tick: function() {
    this.setState({isCursorVisible: !this.state.isCursorVisible});
  },


  render: function(): React.Element {
    return <Edit aClass={this.state.aClass}
                 classId={this.props.aClass}
                 assignment={this.state.assignment}
                 responses={this.state.responses}
                 isHelpDialogShown={this.state.isHelpDialogShown}
                 num={this.state.num}
                 cursor={this.state.cursor}
                 highlight={this.state.highlight}
                 equation={this.state.equation}
                 append={this.state.append}
                 leftParens={this.state.leftParens}
                 rightParens={this.state.rightParens}
                 deltas={this.state.deltas}
                 changes={this.state.changes}
                 isCursorVisible={this.state.isCursorVisible}
                 undos={this.state.undos}
                 redos={this.state.redos}
                 isMousePressed={this.state.isMousePressed}
                 drag={this.state.drag}
                 isTutorialDismissed={this.state.isTutorialDismissed}
                 isSubmissionPending={this.state.isSubmissionPending}
                 isPractice={this.isPracticeMode}
                 dismissTutorial={this._dismissTutorial}
                 handleSubmit={this._handleSubmit}
                 selectQuestion={this._selectQuestion}
                 nextQuestion={this._handleNextQuestion}
                 prevQuestion={this._handlePrevQuestion}
                 showHelpDialog={this._showHelpDialog}
                 hideHelpDialog={this._hideHelpDialog}
                 repositionCursor={this._handleCursorReposition}
                 stageCursorHighlight={this._stageCursorHighlight}
                 commitCursorHighlight={this._commitCursorHighlight} />;
  },

  _selectQuestion: function(num: number): void {
    debug('select question', num);
    let {responses} = this.state;
    let {work} = responses[num];
    let equation = work[work.length - 1].state[0];
    // $FlowFixMe
    this.didSelectQuestion = true;
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

  _handleNextQuestion: function(): void {
    let {num, responses} = this.state;
    this._selectQuestion((num + 1) % responses.length);
  },

  _handlePrevQuestion: function(): void {
    let {num, responses} = this.state;
    this._selectQuestion(num === 0 ? responses.length - 1 : num - 1);
  },

  _handleKeyDown: async function(event: KeyboardEvent): Promise<void> {
    if (this.isBusy) {
      debug('Busy... will ignore key event');
      return;
    }

    // $FlowFixMe
    this.isBusy = true;
    if (event.key === 'Backspace') {
      event.preventDefault();
    }

    let {num} = this.state;
    if (typeof num === 'number') {
      let action = this._handleKeyEvent(event);
      if (action instanceof Promise) {
        await action;
      }
    }

    // $FlowFixMe
    this.isBusy = false;
  },

  _handleKeyEvent: function(event: KeyboardEvent) {
    if (event.shiftKey) {
      return this._handleShiftKey(event);
    }

    if (event.ctrlKey || event.metaKey) {
      return this._handleCtrlKey(event);
    }

    return this._handleNoModifierKey(event);
  },

  _handleNoModifierKey: function(event: KeyboardEvent) {
    let {equation, cursor} = this.state;
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        cursor = Math.max(0, cursor - 1);
        return this.setState({cursor, isCursorVisible: true});
      case 'ArrowRight':
        event.preventDefault();
        cursor = Math.min(equation.length, cursor + 1);
        return this.setState({cursor, isCursorVisible: true});
      default:
        return this._handleDelta(event);
    }
  },

  _handleShiftKey: function(event: KeyboardEvent) {
    let {cursor, equation, highlight} = this.state;
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (cursor === 0) {
          return;
        }

        cursor = Math.max(cursor - 1);
        highlight[cursor] = !highlight[cursor];
        return this.setState({cursor, highlight, isCursorVisible: true});
      case 'ArrowRight':
        event.preventDefault();
        if (cursor === equation.length) {
          return;
        }

        highlight[cursor] = !highlight[cursor];
        cursor = Math.max(cursor + 1);
        return this.setState({cursor, highlight, isCursorVisible: true});
      case 'R':
        if (event.ctrlKey) {
          return this._handleRedo();
        }

        break;
      default:
        this._handleDelta(event);
    }
  },

  _handleCtrlKey: function(event: KeyboardEvent) {
    let {responses, num, cursor, equation} = this.state;
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        return this.setState({
          cursor: editor.moveCursorLeft(cursor, equation),
          isCursorVisible: true
        });
      case 'ArrowRight':
        event.preventDefault();
        return this.setState({
          cursor: editor.moveCursorRight(cursor, equation),
          isCursorVisible: true
        });
      case 'a':
        event.preventDefault();
        return this.setState({cursor: 0, isCursorVisible: true});
      case 'd':
        event.preventDefault();
        return this._selectQuestion((num + 1) % responses.length);
      case 'e':
        event.preventDefault();
        return this.setState({cursor: equation.length, isCursorVisible: true});
      case 'u':
        event.preventDefault();
        return this._selectQuestion(num === 0 ? responses.length - 1 : num - 1);
      case 'z':
        event.preventDefault();
        return this._handleUndo();
      default:
        debug(`Unknown control sequence ${event.key}`);
    }
  },

  _handleDelta: function(event: KeyboardEvent) {
    debug('delta', event);
    if (event.key === 'Enter') {
      return this._commitDelta();
    }

    let chr = charFromKeyEvent(event);
    if (event.key !== 'Backspace' && !chr) {
      return debug('Did not process delta on key event', event);
    }

    let highlights = this._getHighlights();
    return highlights.length ?
      this._handleSelections(event, highlights) :
      this._handleChar(event);
  },

  _handleChar: function(event: KeyboardEvent) {
    let {deltas, append} = this.state;
    if (append.length) {
      return this._handleBothSidesChar(event);
    }

    if (!deltas.length) {
      return event.key === 'Backspace' ?
        this._handleBackspace(event) :
        this._handleFirstChar(event);
    }

    // In this case the previous delta was a cancel or replace.
    if (event.key === 'Backspace') {
      return this._handleBackspace(event);
    }

    debug('extend replace');
    let {cursor} = this.state;
    let chr = charFromKeyEvent(event);
    if (!chr) {
      return;
    }

    return this._appendDelta(
      {type: 'replace', range: [cursor, null], replacement: chr},
      cursor + 1
    );
  },

  _handleBackspace: function(event: KeyboardEvent) {
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
  _handleFirstChar: async function(event: KeyboardEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    let result = await editor.applyFirstChar(event, this.state);
    if (!result) {
      return;
    }

    this._saveState();
    this.setState(result);
  },

  _handleBothSidesChar: function(event: KeyboardEvent) {
    debug('handle both sides char');
    event.preventDefault();

    let result = editor.applyBothSidesChar(event, this.state);
    if (!result) {
      return;
    }

    this._saveState();
    this.setState(result);
  },

  _handleSelections: async function(event: KeyboardEvent,
                                    highlights: Array<Range>): Promise<void> {
    let {cursor} = this.state;
    highlights.reverse();
    for (let i = 0; i < highlights.length; i++) {
      let highlight = highlights[i];
      let {start, end} = highlight;
      await this._handleSelection(
        cursor >= start && cursor <= end + 1 ?
          event :
          {
            key: 'Backspace',
            keyCode: 8,
            preventDefault: () => {},
            stopPropagation: () => {}
          },
        start,
        end
      );
    }
  },

  _handleSelection: function(event: KeyboardEvent, start: number, end: number) {
    debug('handle selection', stringify(arguments));
    event.preventDefault();

    let args = editor.selectionToDiffArgs(event, start, end);
    if (!Array.isArray(args)) {
      return;
    }

    return this._appendDelta(...args);
  },

  _handleUndo: async function(): Promise<void> {
    debug('handle undo');
    let next = editor.undoChar(this.state.undos, this.state.redos, this.state);
    if (next) {
      return this.replaceState(next);
    }

    let {aClass, assignment, submission} = this.props;
    let {responses, num} = this.state;
    let {work} = responses[num];
    this.setState({redos: []});
    await submissions.popDelta(aClass, assignment, submission, num, work);
    this._selectQuestion(num);
  },

  _handleRedo: async function(): Promise<void> {
    debug('handle redo');
    let next = editor.redoChar(this.state.undos, this.state.redos, this.state);
    if (next) {
      this.replaceState(next);
    }
  },

  _saveState: function() {
    let state = clone(this.state);
    let undos = state.undos.concat(state);
    this.setState({undos, redos: []});
  },

  _getHighlights: function() {
    return editor.getHighlights(this.state.highlight);
  },

  _appendDelta: async function(delta: Object, cursor: number): Promise<void> {
    debug('appendDelta', stringify(arguments));
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

  _commitDelta: async function(): Promise<void> {
    let {aClass, assignment, submission, id} = this.props;
    let {responses, num, changes, equation, append, leftParens, rightParens} = this.state;
    await editor.commitDelta(
      aClass,
      assignment || id,
      submission,
      responses,
      num,
      changes,
      equation,
      append,
      leftParens,
      rightParens
    );

    // $FlowFixMe
    this.didCommitDelta = true;
    // This will reset all of our work on the current state.
    this._selectQuestion(num);
  },

  _handleSubmit: async function(): Promise<void> {
    debug('submit assignment');
    let {aClass, assignment, submission, id} = this.props;
    this.setState({isSubmissionPending: true});
    try {
      await submissions.submit(aClass, assignment || id, submission);
    } catch (error) {
      debug(error.toString());
      alert('Error grading assignment! Please try clicking submit again.');
      this.setState({isSubmissionPending: false});
      return;
    }

    location.hash = this.isPracticeMode ?
      `#!/practice/${id}/` :
      `#!/classes/${aClass}/assignments/${assignment}/submissions/${submission}/`;
  },

  _handleCursorReposition: function(event: MouseEvent): void {
    debug('cursor reposition', event);
    event.stopPropagation();

    this.setState({
      cursor: editor.eventToCursorPosition(event),
      isCursorVisible: true,
      isMousePressed: true
    });
  },

  _stageCursorHighlight: function(event: MouseEvent) {
    event.stopPropagation();
    if (!this.state.isMousePressed) {
      return;
    }

    this.setState({drag: editor.eventToCursorPosition(event)});
  },

  _commitCursorHighlight: function(event: MouseEvent) {
    debug('commit cursor highlight', event);
    event.stopPropagation();

    let {highlight, cursor, drag} = this.state;
    this.setState({
      highlight: editor.applyDragToHighlight(highlight, cursor, drag),
      isMousePressed: false,
      drag: null
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

  _dismissTutorial: function() {
    this.setState({isTutorialDismissed: true});
  }
});
