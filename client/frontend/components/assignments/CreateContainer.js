/* @flow */

let Create = require('./Create');
let KaTeXContainer = require('../KaTeXContainer');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let assignment = require('../../helpers/assignment');
let classes = require('../../store/classes');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');
let session = require('../../session');

module.exports = React.createClass({
  displayName: 'assignments/Create',

  mixins: [ReactFire],

  getInitialState: function(): Object {
    let user = session.get('user');

    return {
      user,
      aClass: {},
      isPracticeMode: user.role === 'student',
      topics: [],
      topic: null,
      isTopicAdded: false,
      assignments: [],
      theAssignment: assignment.createAssignment()
    };
  },

  // $FlowFixMe
  componentWillMount: async function(): Promise<void> {
    this.bindAsArray(
      createSafeFirebaseRef('topics'),
      'topics'
    );

    let {user, isPracticeMode} = this.state;
    if (isPracticeMode) {
      return this.bindAsArray(
        createSafeFirebaseRef(`students/${user.id}/assignments`),
        'assignments'
      );
    }

    let id = this.props.aClass;
    this.bindAsArray(
      createSafeFirebaseRef(`classes/${id}/assignments`),
      'assignments'
    );

    let aClass = await classes.get(id);
    this.setState({aClass});
  },

  componentDidUpdate: function() {
    let {topics} = this.state;
    if (topics.length > 0) {
      this.props.onload();
    }
  },

  render: function(): React.Element {
    return <Create user={this.state.user}
                   aClass={this.state.aClass}
                   classId={this.props.aClass}
                   isPracticeMode={this.state.isPracticeMode}
                   topics={this.state.topics}
                   topic={this.state.topic}
                   isTopicAdded={this.state.isTopicAdded}
                   assignments={this.state.assignments}
                   theAssignment={this.state.theAssignment}
                   showModal={this.props.showModal}
                   displayModalError={this.props.displayModalError}
                   displayModalSuccess={this.props.displayModalSuccess}
                   clearMessages={this.props.clearMessages}
                   addTopic={this._handleAddTopic}
                   setTopic={this._handleSetTopic}
                   incrementTopicCount={this._handleIncrementTopicCount}
                   decrementTopicCount={this._handleDecrementTopicCount}
                   incrementDeadline={this._handleIncrementDeadline}
                   decrementDeadline={this._handleDecrementDeadline}
                   preview={this._handlePreview}
                   assign={this._handleAssign}
                   start={this._handleStart} />;
  },

  _updateAssignment: function(method: string, args: Array<any>) {
    args = Array.from(args);
    args.unshift(this.state.theAssignment);
    let theAssignment = assignment[method].apply(null, args);
    this.setState({theAssignment});
  },

  _handleAddTopic: function() {
    this._updateAssignment('addTopic', arguments);
    this.setState({isTopicAdded: true});
    if (this.addTopicTimeout) {
      clearTimeout(this.addTopicTimeout);
    }

    // $FlowFixMe
    this.addTopicTimeout = setTimeout(() => this.setState({isTopicAdded: false}), 1500);
  },

  _handleSetTopic: function(topic: Object): void {
    this.setState({topic});
  },

  _handleIncrementTopicCount: function(): void {
    this._updateAssignment('incrementTopicCount', arguments);
  },

  _handleDecrementTopicCount: function() {
    this._updateAssignment('decrementTopicCount', arguments);
  },

  _handleIncrementDeadline: function() {
    this._updateAssignment('incrementDeadline', arguments);
  },

  _handleDecrementDeadline: function() {
    this._updateAssignment('decrementDeadline', arguments);
  },

  _handlePreview: async function(): Promise<void> {
    let {aClass, assignments, theAssignment, isPracticeMode} = this.state;
    theAssignment = await assignment.getPreview(theAssignment);
    this.setState({theAssignment});

    let cols = [
      {content: '', width: 100},
      {content: '', width: 460}
    ];

    let {preview, created, deadline} = theAssignment;
    // $FlowFixMe: preview definitely exists but flow doesn't know that.
    let rows = preview.map((question, index) => {
      return [
        `${index + 1}.`,
        <KaTeXContainer ascii={question.question} />
      ];
    });

    this.props.showModal(
      <div className="assignment-preview">
        <div className="assignment-details">
          <div className="assignment-name"
               style={{color: isPracticeMode ? '#3996f0' : aClass.color}}>
            {isPracticeMode ? 'Summary' : `Assignment ${assignments.length + 1}`}
          </div>
          {
            isPracticeMode ?
              <div className="class-code">
                <div className="class-code-key">Created on</div>
                <div className="class-code-value">
                  {created.format('dddd, MMM Do YYYY')}
                </div>
              </div> :
              <div className="class-code">
                <div className="class-code-key">Deadline</div>
                <div className="class-code-value">
                  {deadline.format('dddd, MMM Do YYYY')}
                </div>
              </div>
          }
        </div>
        <Tabular cols={cols} rows={rows} />
      </div>
    );
  },

  _handleAssign: async function(): Promise<void> {
    let {aClass, assignments, theAssignment} = this.state;
    await assignment.assign(aClass, assignments, theAssignment);
    location.hash = `#!/classes/${this.props.aClass}/`;
  },

  _handleStart: async function(): Promise<void> {
    let {assignments, theAssignment} = this.state;
    let practiceId = await assignment.practice(assignments, theAssignment);
    location.hash = `#!/practice/${practiceId}/edit/`;
  }
});
