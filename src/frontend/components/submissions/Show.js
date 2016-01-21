let Firebase = require('firebase/lib/firebase-web');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignments = require('../../store/assignments');
let classes = require('../../store/classes');
let {firebaseUrl} = require('../../constants');
let helper = require('../../helpers/submission');
let session = require('../../session');

module.exports = React.createClass({
  displayName: 'submissions/Show',

  mixins: [ReactFire],

  getInitialState: function() {
    return {
      aClass: {},
      assignment: {},
      responses: [],
      user: session.get('user')
    };
  },

  componentWillMount: async function() {
    session.on('user', this._onUser);
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
  },

  componentWillUnmount: function() {
    session.removeListener('user', this._onUser);
  },

  render: function() {
    let {user, aClass, assignment} = this.state;
    return <div id="submissions-show">
      <Topbar headerText={`${user.first} ${user.last}${assignment.name ? ', ' + assignment.name : ''}`} />
      <div className="view">
        {
          (() => {
            switch (user.role) {
              case 'student':
                return <a className="backlink clickable-text"
                          href={`#!/classes/${this.props.aClass}`}>
                  &lt; {aClass && aClass.name}
                </a>;
              case 'teacher':
                return <a className="backlink clickable-text"
                          href={`#!/classes/${this.props.aClass}/assignments/${assignment.id}/`}>
                  &lt; {assignment && assignment.name}
                </a>;
              default:
                throw new Error(`Unexpected user role ${user.role}`);
            }
          })()
        }
        <Tabular cols={[
                   {content: '', width: 50},
                   'Question',
                   'Answer',
                   {content: 'Error', width: 425},
                   {content: 'Result', width: 40}
                 ]}
                 rows={this._renderResults()} />
      </div>
    </div>;
  },

  _renderResults: function() {
    let {responses} = this.state;
    return responses.map((response, index) => {
      let {question, work} = response;
      let answer = work[work.length - 1].state[0];
      let correct = helper.isCorrect(question, answer);
      return [
        `${index + 1}.`,
        question.question,
        answer,
        correct ? <div></div> : this._renderError(response),
        correct ?
          <div style={{color: '#71ac00'}}>✔</div> :
          <div style={{color: '#e22517'}}>✗</div>
      ];
    });
  },

  _renderError: function(response) {
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
  },

  _onUser: function(user) {
    this.setState({user});
  }
});
