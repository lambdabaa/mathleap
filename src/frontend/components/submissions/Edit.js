let Firebase = require('firebase/lib/firebase-web');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignments = require('../../store/assignments');
let bridge = require('../../bridge');
let charFromKeyEvent = require('../../charFromKeyEvent');
let classes = require('../../store/classes');
let debug = console.log.bind(console, '[components/submissions/Edit]');
let includes = require('lodash/collection/includes');
let {mapChar} = require('../../../common/string');
let submissions = require('../../store/submissions');

let skipStops = Object.freeze([
  '=',
  '>',
  '≥',
  '<',
  '≤',
  '+',
  '-',
  '*',
  '/',
  '^'
]);

module.exports = React.createClass({
  displayName: 'submissions/edit',

  mixins: [ReactFire],

  getInitialState: function() {
    return {
      aClass: {},
      assignment: {},
      responses: [],
      num: null,
      cursor: null,
      highlight: null,
      equation: null,
      append: '',
      deltas: [],
      changes: null
    };
  },

  componentWillMount: async function() {
    let {aClass, assignment, submission} = this.props;

    this.bindAsArray(
      new Firebase(`https://mathleap.firebaseio.com/classes/${aClass}/assignments/${assignment}/submissions/${submission}/responses`),
      'responses'
    );

    let theClass = await classes.get(aClass);
    let theAssignment = await assignments.get(aClass, assignment);
    this.setState({aClass: theClass, assignment: theAssignment});
    document.addEventListener('keydown', this._handleKeyPress, true);
  },

  componentWillUnmount: function() {
    document.removeEventListener('keydown', this._handleKeyPress);
  },

  render: function() {
    let {aClass, assignment} = this.state;
    return <div id="submissions-edit">
      <Topbar headerText={assignment.name} />
      <div className="view">
        <div className="backlink clickable-text"
             onClick={this._handleBack}>
          &lt; {aClass && aClass.name}
        </div>
        <div className="submissions-edit-workspace">
          {this._renderQuestionList()}
          {this._renderQuestion()}
        </div>
      </div>
    </div>;
  },

  _renderQuestionList: function() {
    let {responses, num} = this.state;
    let questions = responses.map((aResponse, index) => {
      return [
        <div className="clickable-text"
             style={{fontWeight: 'bold'}}
             onClick={this._selectQuestion.bind(this, index)}>
          {index + 1}
        </div>,
        <div className="clickable-text"
             onClick={this._selectQuestion.bind(this, index)}>
          {aResponse.question.question}
        </div>
      ];
    });

    return <Tabular className="dark"
                    cols={[
                      {content: 'Questions', width: 30},
                      {content: '', width: 220}
                    ]}
                    rows={questions}
                    selected={num} />;
  },

  _renderQuestion: function() {
    let {responses, num, equation, append, cursor} = this.state;
    let rows = [];
    let response = responses[num];
    if (response) {
      let {work} = response;
      rows = work.map((step, index) => {
        // We need a special case for the last row since we need
        // to apply the outstanding (uncommitted) changes.
        if (index === work.length - 1) {
          return [
            this._renderChanges(step.state[0], this.state.changes, append),
            this._renderResults(equation, cursor)
          ];
        }

        let next = work[index + 1];
        return [
          this._renderChanges(step.state[0], step.changes[0], step.appends ? step.appends[0] : ''),
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

  _renderChanges: function(equation, changes, append = '') {
    return <div className="submissions-edit-active">
      {
        (() => {
          function renderEquationChar(chr, index) {
            let style = {};
            let change = changes[index];
            switch (change) {
              case 'highlight':
                style.backgroundColor = 'rgba(57, 150, 240, 0.5)';
                break;
              case 'strikethrough':
                style.textDecoration = 'line-through';
                style.color = '#e22517';
                break;
            }

            return <div style={style}>
              <span style={{color: 'black'}}>{chr}</span>
            </div>;
          }

          function renderAppendChar(chr) {
            return <div style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
              <span style={{color: 'black'}}>{chr}</span>
            </div>;
          }

          let [left, right] = equation.split('=');
          return mapChar(left, renderEquationChar)
            .concat(mapChar(append, renderAppendChar))
            .concat([renderEquationChar('=', left.length)])
            .concat(mapChar(right, (chr, index) => renderEquationChar(chr, index + left.length + 1)))
            .concat(mapChar(append, renderAppendChar));
        })()
      }
    </div>;
  },

  _renderResults: function(equation, cursor) {
    if (typeof cursor !== 'number') {
      return equation;
    }

    let {highlight} = this.state;
    return <div className="submissions-edit-active">
      {
        mapChar(equation.slice(0, cursor), (chr, index) => {
          let style = {};
          if (highlight && highlight[index]) {
            style.backgroundColor = 'rgba(57, 150, 240, 0.5)';
          }

          return <div style={style}>{chr}</div>;
        })
      }

      <div className="submissions-edit-cursor">|</div>

      {
        mapChar(equation.slice(cursor), (chr, index) => {
          let style = {};
          if (highlight && highlight[cursor + index]) {
            style.backgroundColor = 'rgba(57, 150, 240, 0.5)';
          }

          return <div style={style}>{chr}</div>;
        })
      }
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
      changes: mapChar(equation, () => 'none'),
      highlight: mapChar(equation, () => false),
      cursor: equation.length,
      delta: []
    });
  },

  _handleKeyPress: function(event) {
    if (event.keyCode === 8) {
      event.preventDefault();
    }

    let {cursor, equation, num} = this.state;
    if (typeof num !== 'number') {
      return;
    }

    if (event.shiftKey) {
      return this._handleShiftKey(event);
    }

    if (event.ctrlKey) {
      return this._handleCtrlKey(event);
    }

    switch (event.keyCode) {
      case 37:
        event.preventDefault();
        cursor = Math.max(0, cursor - 1);
        return this.setState({cursor});
      case 39:
        event.preventDefault();
        cursor = Math.min(equation.length, cursor + 1);
        return this.setState({cursor});
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
        return this.setState({cursor, highlight});
      case 39:
        event.preventDefault();
        if (cursor === equation.length) {
          return;
        }

        highlight[cursor] = !highlight[cursor];
        cursor = Math.max(cursor + 1);
        return this.setState({cursor, highlight});
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

        return this.setState({cursor});
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

        return this.setState({cursor});
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
    }
  },

  _handleDelta: function(event) {
    debug('delta', event);
    if (event.keyCode === 13) {
      return this._commitDelta();
    }

    let {start, end} = this._getHighlight();
    return typeof start !== 'number' || typeof end !== 'number' ?
      this._handleChar(event) :
      this._handleSelection(event, start, end);
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

  _handleBackspace: function() {
    debug('handle backspace');
    let {cursor} = this.state;
    if (cursor === 0) {
      debug('Can\'t backspace at 0.');
      return;
    }

    return this._appendDelta(
      {type: 'cancel', range: [cursor, cursor]},
      cursor - 1
    );
  },

  /**
   * Nothing has been done in the current step and the student
   * entered some character.
   */
  _handleFirstChar: function(event) {
    let operator;
    switch (event.keyCode) {
      case 54:
        if (event.shiftKey) operator = '^';
        break;
      case 56:
        if (event.shiftKey) operator = '*';
        break;
      case 61:
      case 187:
        if (event.shiftKey) operator = '+';
        break;
      case 173:
      case 179:
        operator = '-';
        break;
      case 191:
        operator = '/';
        break;
    }

    debug('handle first char', operator);

    if (!operator) {
      // random characters typed...?
      return;
    }

    this.setState({append: operator});
  },

  _handleBothSidesChar: function(event) {
    debug('handle both sides char');
    let {append} = this.state;
    let chr = charFromKeyEvent(event);
    if (!chr) {
      return;
    }

    append = event.keyCode === 8 ?
      append.slice(0, append.length - 1) :
      append + chr;
    this.setState({append});
  },

  _handleSelection: function(event, start, end) {
    debug('handle selection');
    let args;
    if (event.keyCode === 8) {
      args = [
        {type: 'cancel', range: [start, end]},
        start
      ];
    } else {
      let chr = charFromKeyEvent(event);
      if (!chr) {
        return;
      }

      args = [
        {type: 'replace', range: [start, end], replacement: chr},
        start + 1
      ];
    }

    return this._appendDelta(...args);
  },

  _getHighlight: function() {
    let {cursor, highlight} = this.state;
    // Are we to the right of a highlight?
    let right = cursor > 0 && highlight[cursor - 1];
    // Are we to the left of a highlight?
    let left = highlight[cursor];

    let start, end;
    if (left) {
      if (right) {
        // We're in the middle of a highlight.
        start = this._getLeftBound();
        end = this._getRightBound();
      } else {
        // We're on the left of a highlight.
        start = cursor;
        end = this._getRightBound();
      }
    } else if (right) {
      // We're on the left of a highlight.
      start = this._getLeftBound();
      end = cursor - 1;
    }

    return {start, end};
  },

  _getLeftBound: function() {
    let {cursor, highlight} = this.state;
    let bound = cursor - 1;
    while (highlight[bound - 1]) {
      bound -= 1;
    }

    return bound;
  },

  _getRightBound: function() {
    let {cursor, highlight} = this.state;
    let bound = cursor;
    while (highlight[bound + 1]) {
      bound += 1;
    }

    return bound;
  },

  _appendDelta: async function(delta, cursor) {
    if (!delta) {
      return;
    }

    if ('replacement' in delta) {
      let {replacement} = delta;
      if (!/^[a-zA-Z0-9\+\-\*\/\^]+$/.test(replacement)) {
        debug(`Invalid input character: ${replacement}`);
        return;
      }
    }

    let {responses, num, deltas} = this.state;
    let {work} = responses[num];
    let {state} = work[work.length - 1];
    deltas.push(delta);
    let {result, changes} = await bridge('diff', state[0], deltas);
    debug('result', result);
    debug('changes', JSON.stringify(changes));
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
    let {responses, num, changes, equation, append} = this.state;
    let {work} = responses[num];
    let [left, right] = equation.split('=');
    await submissions.commitDelta(
      aClass,
      assignment,
      submission,
      num,
      work,
      [changes],
      [append],
      [`${left}${append}=${right}${append}`]
    );

    // This will reset all of our work on the current state.
    this._selectQuestion(num);
  },

  _handleBack: function() {
    location.hash = `#!/classes/${this.props.aClass}/`;
  }
});
