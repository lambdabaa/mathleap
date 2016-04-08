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
let ctrlOrMeta = require('../../ctrlOrMeta');
let debug = require('../../../common/debug')('components/submissions/Edit');
let editor = require('../../helpers/editor');
let firebaseChild = require('../../firebaseChild');
let getQuestionType = require('../../getQuestionType');
let isElementVisible = require('../../isElementVisible');
let {mapChar} = require('../../../common/string');
let preventDefault = require('../../preventDefault');
let session = require('../../session');
let stmt = require('../../../common/stmt');
let stringify = require('../../../common/stringify');
let submissions = require('../../store/submissions');
let waitFor = require('../../../common/waitFor');

import type {
  AssignmentSection,
  FBResponse,
  KeyboardEvent,
  Range
} from '../../../common/types';

module.exports = React.createClass({
  displayName: 'submissions/Edit',

  mixins: [ReactFire],

  getInitialState: function(): Object {
    return {
      aClass: {},
      assignment: {},
      submission: [],

      // Whether the keyboard shortcuts are shown.
      isHelpDialogShown: false,

      // index of active equation
      num: null,

      // response environment
      questionType: 'equation-editor',

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

      // Whether we're waiting for a submit action
      isSubmissionPending: false,

      isReadOnly: false,

      status: '',

      isStatusShown: false
    };
  },

  // $FlowFixMe
  componentWillMount: async function(): Promise<void> {
    let {aClass, assignment, submission, id} = this.props;
    if (aClass) {
      // $FlowFixMe
      this.isPracticeMode = false;
      this.bindAsArray(
        createSafeFirebaseRef(`classes/${aClass}/assignments/${assignment}/submissions/${submission}/`),
        'submission'
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
        createSafeFirebaseRef(`students/${user.id}/assignments/${id}/submission/`),
        'submission'
      );

      let theAssignment = await assignments.getPractice(id);
      this.setState({assignment: theAssignment});
    } else {
      throw new Error('Nowhere to find responses!');
    }
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

    this._checkForReadOnlyView();
  },

  componentWillUnmount: function(): void {
    clearInterval(this.interval);
    // $FlowFixMe
    document.removeEventListener('keydown', this._handleKeyDown);
    document.removeEventListener('keypress', preventDefault);
  },

  componentWillUpdate: function(props: Object, state: Object): void {
    let {questionType} = state;
    if (questionType === 'equation-editor') {
      if (!this.isKeyboardOn) {
        debug('Turn on keyboard');
        // $FlowFixMe
        this.isKeyboardOn = true;
        // $FlowFixMe
        document.addEventListener('keydown', this._handleKeyDown);
        document.addEventListener('keypress', preventDefault);
      }
    } else if (this.isKeyboardOn) {
      debug('Turn off keyboard');
      // $FlowFixMe
      this.isKeyboardOn = false;
      document.removeEventListener('keydown', this._handleKeyDown);
      document.removeEventListener('keypress', preventDefault);
    }
  },

  componentDidUpdate: function(): void {
    let {num, isStatusShown} = this.state;
    let responses = this._getResponses();
    if (responses && responses.length && num == null) {
      this._selectQuestion(0);
      return;
    }

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

    if (typeof num === 'number') {
      let step = $('.submissions-edit-question .tabular-row:last-child');
      if (step && !isElementVisible(step)) {
        step.focus();
      }
    }

    if (isStatusShown && !this.statusTimeout) {
      // $FlowFixMe
      this.statusTimeout = setTimeout(() => {
        this.setState({isStatusShown: false});
        // $FlowFixMe
        this.statusTimeout = null;
      }, 1500);
    }

    this._checkForReadOnlyView();
  },

  _tick: function() {
    this.setState({isCursorVisible: !this.state.isCursorVisible});
  },


  render: function(): React.Element {
    let {num, isSubmissionPending} = this.state;
    if (typeof num === 'number' && !isSubmissionPending) {
      setTimeout(this.props.onload, 0);
    }

    return <Edit aClass={this.state.aClass}
                 classId={this.props.aClass}
                 assignment={this.state.assignment}
                 responses={this._getResponses()}
                 isHelpDialogShown={this.state.isHelpDialogShown}
                 num={num}
                 questionType={this.state.questionType}
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
                 isSubmissionPending={isSubmissionPending}
                 isPractice={this.isPracticeMode}
                 isReadOnly={this.state.isReadOnly}
                 status={this.state.status}
                 isStatusShown={this.state.isStatusShown}
                 showModal={this.props.showModal}
                 displayModalError={this.props.displayModalError}
                 displayModalSuccess={this.props.displayModalSuccess}
                 clearMessages={this.props.clearMessages}
                 handleSubmit={this._handleSubmit}
                 selectQuestion={this._selectQuestion}
                 nextQuestion={this._handleNextQuestion}
                 prevQuestion={this._handlePrevQuestion}
                 commitAnswer={this._commitAnswer}
                 showHelpDialog={this._showHelpDialog}
                 hideHelpDialog={this._hideHelpDialog}
                 repositionCursor={this._handleCursorReposition}
                 stageCursorHighlight={this._stageCursorHighlight}
                 commitCursorHighlight={this._commitCursorHighlight} />;
  },

  _getResponses: function(): Array<FBResponse> {
    let {submission} = this.state;
    return firebaseChild.findArrayChild(submission);
  },

  _isSubmissionComplete: function(state: ?Object): boolean {
    if (!state) {
      state = this.state;
    }

    let {submission} = state;
    let complete = firebaseChild.findByKey(submission, 'complete');
    return typeof complete === 'boolean' ? complete : false;
  },

  _selectQuestion: async function(num: number): Promise<void> {
    debug('select question', num);
    let responses = this._getResponses();
    let {work} = responses[num];
    let equation = work[work.length - 1].state[0];
    // $FlowFixMe
    this.didSelectQuestion = true;
    let questionType = await this._getQuestionType(num);
    debug('question type', questionType);
    this.setState({
      num,
      questionType,
      equation,
      append: '',
      leftParens: false,
      rightParens: false,
      changes: mapChar(equation, () => 'none'),
      highlight: mapChar(equation, () => false),
      cursor: equation.length,
      deltas: [],
      undos: [],
      redos: [],
      status: null
    });
  },

  _handleNextQuestion: function(): void {
    let {num} = this.state;
    let responses = this._getResponses();
    this._selectQuestion((num + 1) % responses.length);
  },

  _handlePrevQuestion: function(): void {
    let {num} = this.state;
    let responses = this._getResponses();
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

    if (ctrlOrMeta(event)) {
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
        if (cursor === stmt.getStmtSplit(equation)) {
          return this._complainSymbolHighlight();
        }

        highlight[cursor] = !highlight[cursor];
        return this.setState({cursor, highlight, isCursorVisible: true});
      case 'ArrowRight':
        event.preventDefault();
        if (cursor === equation.length) {
          return;
        }

        if (cursor === stmt.getStmtSplit(equation)) {
          return this._complainSymbolHighlight();
        }

        highlight[cursor] = !highlight[cursor];
        cursor = Math.max(cursor + 1);
        return this.setState({cursor, highlight, isCursorVisible: true});
      case 'R':
      case 'Z':
        if (ctrlOrMeta(event)) {
          return this._handleRedo();
        }

        break;
      default:
        this._handleDelta(event);
    }
  },

  _handleCtrlKey: function(event: KeyboardEvent) {
    let {cursor, equation} = this.state;
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
        return this._handleNextQuestion();
      case 'e':
        event.preventDefault();
        return this.setState({cursor: equation.length, isCursorVisible: true});
      case 'u':
        event.preventDefault();
        return this._handlePrevQuestion();
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
      cursor - 1,
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
            ctrlKey: false,
            metaKey: false,
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
    let {num} = this.state;
    let responses = this._getResponses();
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
    let {num, deltas, status, isStatusShown} = this.state;
    if (!deltas.length) {
      isStatusShown = true;
      switch (delta.type) {
        case 'cancel':
          status = 'Cancelling term(s)...';
          break;
        case 'replace':
          status = 'Simplifying expression...';
          break;
      }
    }

    let responses = this._getResponses();
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
      highlight: mapChar(result, () => false),
      status,
      isStatusShown
    });
  },

  _commitAnswer: async function(answer: string): Promise<void> {
    let {aClass, assignment, submission, id} = this.props;
    let {num} = this.state;
    let responses = this._getResponses();
    await editor.commitAnswer(
      aClass,
      assignment || id,
      submission,
      responses,
      num,
      answer
    );
  },

  _commitDelta: async function(): Promise<void> {
    let {aClass, assignment, submission, id} = this.props;
    let {num, changes, equation, append, leftParens, rightParens} = this.state;
    let responses = this._getResponses();
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
    this.props.onpending();
    let {aClass, assignment, submission, id} = this.props;
    this.setState({isSubmissionPending: true});
    try {
      await submissions.submit(aClass, assignment || id, submission);
    } catch (error) {
      debug(error.toString());
      this.props.onload();
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

    let {equation, highlight, cursor, drag} = this.state;
    highlight = editor.applyDragToHighlight(highlight, cursor, drag);

    if (drag != null) {
      let index = stmt.getStmtSplit(equation);
      if (index !== -1) {
        if (cursor < index && drag >= index ||
            cursor > index && drag <= index ||
            cursor === index && drag > index) {
          return this._complainSymbolHighlight();
        }
      }

      cursor = drag > cursor ?
        Math.min(equation.length, drag + 1) :
        drag;
    }

    this.setState({
      highlight,
      isMousePressed: false,
      isCursorVisible: true,
      cursor,
      drag: null
    });
  },

  _complainSymbolHighlight: function() {
    alert('Please operate on one side at a time!');
    this.setState({isMousePressed: false, drag: null});
  },

  _showHelpDialog: function() {
    debug('Show help dialog');
    this.setState({isHelpDialogShown: true});
  },

  _hideHelpDialog: function() {
    debug('Hide help dialog');
    this.setState({isHelpDialogShown: false});
  },

  _getQuestionType: async function(num: number): Promise<string> {
    await waitFor(() => {
      let {assignment} = this.state;
      return assignment && assignment.composition;
    });

    let {assignment} = this.state;
    let {composition} = assignment;
    if (typeof composition === 'string') {
      composition = JSON.parse(composition);
      assignment.composition = composition;
      this.setState({assignment});
    }

    let count = 0;
    let section = composition.find((aSection: AssignmentSection): boolean => {
      count += aSection.count;
      return num < count;
    });

    return getQuestionType(section.type.name);
  },

  _checkForReadOnlyView: function() {
    if (this.state.isReadOnly || !this._isSubmissionComplete()) {
      // Either we already know this is read only or it isn't.
      return;
    }

    clearInterval(this.interval);
    document.removeEventListener('keydown', this._handleKeyDown);
    document.removeEventListener('keypress', preventDefault);
    this.setState({isCursorVisible: false, isReadOnly: true});
  }
});
