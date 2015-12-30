let Firebase = require('firebase/lib/firebase-web');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignments = require('../../store/assignments');
let classes = require('../../store/classes');
let {firebaseUrl} = require('../../constants');
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
        <div className="backlink clickable-text" onClick={this._handleBack}>
          &lt; {
            // Student should go back to class view
            // Teacher should go back to assignment list
            user.role === 'student' ?
              aClass && aClass.name :
              assignment && assignment.name
          }
        </div>
        <Tabular cols={[
                   {content: '', width: 50},
                   'Question',
                   'Answer',
                   {content: 'Result', width: 50}
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
      let [left, right] = answer.split('=');
      let solution = question.solution.toString();
      let result = left === solution || right === solution;
      return [
        `${index + 1}.`,
        question.question, answer,
        result ?
          <div style={{color: '#71ac00'}}>✔</div> :
          <div style={{color: '#e22517'}}>✗</div>
      ];
    });
  },

  _handleBack: function() {
    let user = session.get('user');
    switch (user.role) {
      case 'student':
        location.hash = `#!/classes/${this.props.aClass}/`;
        break;
      case 'teacher':
        let {assignment} = this.state;
        location.hash = `#!/classes/${this.props.aClass}/assignments/${assignment.id}/`;
        break;
      default:
        throw new Error(`Unexpected user role ${user.role}`);
    }
  },

  _onUser: function(user) {
    this.setState({user});
  }
});
