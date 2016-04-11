/* @flow */

let KaTeXContainer = require('../KaTeXContainer');
let LinkedStateMixin = require('react-addons-linked-state-mixin');
let React = require('react');
let ReactDOM = require('react-dom');
let ctrlOrMeta = require('../../ctrlOrMeta');
let sleep = require('../../../common/sleep');

import type {KeyboardEvent} from '../../../common/types';

module.exports = React.createClass({
  mixins: [LinkedStateMixin],

  getInitialState: function(): Object {
    return {answer: '', num: null};
  },

  componentWillMount: function() {
    this._bootstrap(this.props);
  },

  componentWillReceiveProps: function(props: Object) {
    this._bootstrap(props);
  },

  componentDidMount: function() {
    this._focus();
  },

  componentDidUpdate: function() {
    this._focus();
  },

  render: function(): React.Element {
    let {responses, num} = this.props;
    let response = responses[num];
    let question = response.question.question;
    return <div className="submissions-edit-question">
      <div className="submissions-edit-simple-question">
        <KaTeXContainer ascii={question} />
        <input type="text"
               className="submissions-edit-answer"
               valueLink={this.linkState('answer')}
               onKeyDown={this._handleKeyDown} />
      </div>
      <div className="next-and-previous">
        <div className="button" onClick={this.props.prevQuestion}>Previous</div>
        <div className="button-inverse" onClick={this.props.nextQuestion}>Next</div>
      </div>
    </div>;
  },

  _bootstrap: function(props: Object) {
    let {responses, num} = props;
    let response = responses[num];
    let {work} = response;
    if (work.length <= 1) {
      return this.setState({answer: ''});
    }

    let answer = work[work.length - 1].state[0];
    this.setState({answer, num});
  },

  _focus: function() {
    let element = ReactDOM.findDOMNode(this);
    let input = element.getElementsByClassName('submissions-edit-answer')[0];
    if (input) {
      input.focus();
    }
  },

  _handleKeyDown: async function(event: KeyboardEvent): Promise<void> {
    if (event.key === 'Enter') {
      await this.props.commitAnswer(this.state.answer);
      return this.props.nextQuestion();
    }

    await sleep(0);
    if (!ctrlOrMeta(event)) {
      return this.props.commitAnswer(this.state.answer);
    }

    switch (event.key) {
      case 'd':
        event.preventDefault();
        return this.props.nextQuestion();
      case 'u':
        event.preventDefault();
        return this.props.prevQuestion();
    }
  }
});
