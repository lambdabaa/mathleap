let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignments = require('../../store/assignments');
let classes = require('../../store/classes');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');
let helper = require('../../helpers/submission');
let session = require('../../session');
let students = require('../../store/students');

module.exports = React.createClass({
  displayName: 'submissions/Show',

  mixins: [ReactFire],

  getInitialState: function() {
    return {
      headerText: '',
      aClass: {},
      assignment: {},
      student: {},
      responses: [],
      marks: []
    };
  },

  componentWillMount: async function() {
    let {aClass, assignment, submission, id} = this.props;
    let user = session.get('user');

    if (aClass) {
      this.isPracticeMode = false;
      this.bindAsArray(
        createSafeFirebaseRef(`classes/${aClass}/assignments/${assignment}/submissions/${submission}/responses`),
        'responses'
      );

      let [theClass, theAssignment] = await Promise.all([
        classes.get(aClass),
        assignments.get(aClass, assignment)
      ]);

      if (user.role === 'teacher') {
        return this.setState({aClass: theClass, assignment: theAssignment});
      }

      let student = await students.get(
        theAssignment.submissions[submission].studentId
      );

      this.setState({aClass: theClass, assignment: theAssignment, student});
    } else if (id) {
      this.isPracticeMode = true;
      this.bindAsArray(
        createSafeFirebaseRef(`students/${user.id}/assignments/${id}/submission/responses`),
        'responses'
      );

      let theAssignment = await assignments.getPractice(id);
      let student = await students.get(user.id);
      this.setState({assignment: theAssignment, student});
    } else {
      throw new Error('Nowhere to find responses!');
    }
  },

  componentWillUpdate: async function(props, state) {
    await Promise.all([
      this._updateHeaderText(state),
      this._updateMarks(state)
    ]);
  },

  _updateHeaderText: async function(state) {
    if (state.headerText.length) {
      return;
    }

    let {student, assignment, responses} = state;
    let user = session.get('user');
    if (user.role === 'teacher') {
      if (typeof assignment.name !== 'string' ||
          !responses.length) {
        return;
      }

      let headerText = await helper.getHeaderText(user, assignment, responses);
      return this.setState({headerText});
    }

    if (typeof student.id !== 'string' || !responses.length) {
      return;
    }

    let headerText = await helper.getHeaderText(student, assignment, responses);
    this.setState({headerText});
  },

  _updateMarks: async function(state) {
    if (state.marks.length === state.responses.length) {
      return;
    }

    let marks = await Promise.all(
      state.responses.map(response => {
        let {question, work} = response;
        let answer = work[work.length - 1].state[0];
        return helper.isCorrect(question, answer, work);
      })
    );

    this.setState({marks});
  },

  render: function() {
    let {headerText, aClass, assignment} = this.state;
    let user = session.get('user');
    return <div id="submissions-show">
      <Topbar headerText={headerText} />
      <div className="view">
        {
          (() => {
            switch (user.role) {
              case 'student':
                let backlink, backlinkText;
                if (this.isPracticeMode) {
                  backlink = `#!/practice/`;
                  backlinkText = <span>&lt; Practice sessions</span>;
                } else {
                  backlink = `#!/classes/${this.props.aClass}/`;
                  backlinkText = <span>&lt; {aClass && aClass.name}</span>;
                }

                return <a className="backlink clickable-text" href={backlink}>{backlinkText}</a>;
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
                   {content: '', width: 40},
                   {content: 'Question', width: 300},
                   'Response',
                   'Answer Key',
                   {content: 'Error', width: 325},
                   {content: 'Result', width: 40}
                 ]}
                 rows={this._renderResults()} />
      </div>
    </div>;
  },

  _renderResults: function() {
    let {responses, marks} = this.state;
    return responses.map((response, index) => {
      let {question, work} = response;
      let answer = work[work.length - 1].state[0];
      let correct = marks[index];
      return [
        `${index + 1}.`,
        question.question,
        answer,
        question.solution,
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
  }
});
