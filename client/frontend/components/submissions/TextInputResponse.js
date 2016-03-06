/* @flow */

let KaTeXContainer = require('../KaTeXContainer');
let LinkedStateMixin = require('react-addons-linked-state-mixin');
let React = require('react');
let ReactDOM = require('react-dom');
let ctrlOrMeta = require('../../ctrlOrMeta');

import type {KeyboardEvent} from '../../../common/types';

module.exports = React.createClass({
  mixins: [LinkedStateMixin],

  getInitialState: function(): Object {
    return {answer: ''};
  },

  componentWillMount: function() {
    let {responses, num} = this.props;
    let response = responses[num];
    let {work} = response;
    if (work.length > 1) {
      let answer = work[work.length - 1].state[0];
      this.setState({answer});
    }
  },

  componentDidMount: function() {
    let element = ReactDOM.findDOMNode(this);
    let input = element.getElementsByClassName('submissions-edit-answer')[0];
    if (input) {
      input.focus();
    }
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

  _handleKeyDown: async function(event: KeyboardEvent): Promise<void> {
    if (event.key === 'Enter') {
      await this.props.commitAnswer(this.state.answer);
      return this.props.nextQuestion();
    }

    if (!ctrlOrMeta(event)) {
      return;
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
