/**
 * @fileoverview Assignment generator.
 */

let ClassCode = require('../ClassCode');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignment = require('../../helpers/assignment');
let classes = require('../../store/classes');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');
let session = require('../../session');

module.exports = React.createClass({
  displayName: 'assignments/Create',

  mixins: [ReactFire],

  getInitialState: function() {
    let user = session.get('user');

    return {
      user,
      aClass: {},
      isPracticeMode: user.role === 'student',
      topics: [],
      topic: null,
      assignments: [],
      theAssignment: assignment.createAssignment()
    };
  },

  componentWillMount: async function() {
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

  render: function() {
    let {aClass, isPracticeMode} = this.state;

    let headerText = isPracticeMode ?
      'Practice Mode' :
      <div className="classes-show-header">
        <div className="classes-show-header-title"
             style={{color: aClass.color}}>
          {aClass.name}
        </div>
        <ClassCode code={aClass.code} />
      </div>;

    let backlink, backlinkText;
    if (isPracticeMode) {
      backlink = '#!/practice/';
      backlinkText = <span>&lt; Practice</span>;
    } else {
      backlink = `#!/classes/${this.props.aClass}/`;
      backlinkText = <span>&lt; {aClass && aClass.name}</span>;
    }

    return <div id="assignments-create">
      <Topbar headerText={headerText} />
      <div className="view">
        <a className="backlink clickable-text" href={backlink}>{backlinkText}</a>
        <div className="assignments-create-level">
          {this._renderTopics()}
          {this._renderQuestionTypes()}
        </div>
        <div className="assignments-create-level">
          {this._renderAssignmentComposition()}
          {this._renderAssignmentSummary()}
        </div>
      </div>
    </div>;
  },

  _renderTopics: function() {
    let {topic, topics} = this.state;
    let selected = -1;
    let rows = topics.map((aTopic, index) => {
      // Highlight the selected topic.
      if (topic && topic.name === aTopic.name) {
        selected = index;
      }

      return [
        <div className="clickable-text"
             onClick={() => this.setState({topic: aTopic})}>
          {aTopic.name}
        </div>
      ];
    });

    return <Tabular className="dark"
      cols={[{content: 'Topics', width: 350}]}
      rows={rows}
      selected={selected} />;
  },

  _renderQuestionTypes: function() {
    let cols = [
      {content: 'Question Type', width: 350},
      {content: '', width: 150},
      {content: '', width: 50, align: 'right'}
    ];

    let {topic} = this.state;
    let rows = topic ?
      topic.types.map(aType => {
        return [
          aType.name,
          `e.g. ${aType.example}`,
          <img className="list-action-btn"
               src="style/images/add_btn.png"
               onClick={this._handleAddTopic.bind(this, topic, aType)} />
        ];
      }) :
      [];

    return <Tabular className="dark"
      cols={cols}
      rows={rows} />;
  },

  _renderAssignmentComposition: function() {
    let {composition} = this.state.theAssignment;
    let rows = composition.map((part, index) => {
      let increment = this._handleIncrementTopicCount.bind(this, index);
      let decrement = this._handleDecrementTopicCount.bind(this, index);
      return {
        content: [
          part.topic.name,
          part.type.name,
          <div className="composition-incrementable">
            {part.count}
            <div className="composition-increment-container">
              <img className="list-action-btn"
                   src="style/images/increase_btn.png"
                   onClick={increment}/>
              <img className="list-action-btn"
                   src="style/images/decrease_btn.png"
                   onClick={decrement} />
            </div>
          </div>
        ],
        tab: part.color
      };
    });

    return <Tabular className="dark"
      cols={[
        {content: 'Topic', width: 280},
        {content: 'Question Type', width: 280},
        {content: 'Number', width: 100}
      ]}
      rows={rows} />;
  },

  _renderAssignmentSummary: function() {
    return this.state.isPracticeMode ?
      this._renderPracticeSummary() :
      this._renderRealSummary();
  },

  _generateChart: function() {
    let count = this._questionCount();
    return <div className="topic-ratio-chart">
      {
        this.state.theAssignment.composition.map((part, index) => {
          let decimal = part.count / count;
          let percent = `${(100 * decimal).toString().substring(0, 5)}%`;
          let fontSize = `${Math.min(16, 160 * decimal)}px`;
          return <div key={index}
                      className="topic-ratio-block-container"
                      style={{height: percent, fontSize}}>
            <div className="topic-ratio-block"
                 style={{backgroundColor: part.color}}>
            </div>
            <div className="topic-ratio-percent">{percent}</div>
          </div>;
        })
      }
    </div>;
  },

  _questionCount: function() {
    return assignment.getSize(this.state.theAssignment);
  },

  _getDeadline: function() {
    return this.state.theAssignment.deadline;
  },

  _renderPracticeSummary: function() {
    let chart = this._generateChart();
    let count = this._questionCount();
    let rows = [
      {
        content: [
          <div className="assignments-create-summary">
            <div className="assignments-create-label">Topic ratio</div>
            <div className="assignments-create-value">{chart}</div>
          </div>
        ],
        height: 279
      },
      [
        <div className="assignments-create-summary">
          <div className="assignments-create-label"># Questions</div>
          <div className="assignments-create-value">{count}</div>
        </div>
      ],
      [
        <div className="assignments-create-summary">
          <div className="assignments-create-label clickable-text"
               onClick={this._handlePreview}>
            Preview
          </div>
          <div className="assignments-create-value clickable-text"
               onClick={this._handleStart}>
            Start
          </div>
        </div>
      ]
    ];

    return <Tabular className="dark"
      cols={[{content: 'Practice Summary', width: 250}]}
      rows={rows} />;
  },

  _renderRealSummary: function() {
    let chart = this._generateChart();
    let count = this._questionCount();
    let deadline = this._getDeadline();

    let rows = [
      {
        content: [
          <div className="assignments-create-summary">
            <div className="assignments-create-label">Topic ratio</div>
            <div className="assignments-create-value">{chart}</div>
          </div>
        ],
        height: 279
      },
      [
        <div className="assignments-create-summary">
          <div className="assignments-create-label"># Questions</div>
          <div className="assignments-create-value">{count}</div>
        </div>
      ],
      [
        <div className="assignments-create-summary">
          <div className="assignments-create-label">Deadline</div>
          <div className="assignments-create-value">
            <div className="composition-incrementable">
              {deadline.format('MM/DD/YY')}
              <div className="composition-increment-container">
                <img className="list-action-btn"
                     src="style/images/increase_btn.png"
                     onClick={this._handleIncrementDeadline}/>
                <img className="list-action-btn"
                     src="style/images/decrease_btn.png"
                     onClick={this._handleDecrementDeadline} />
              </div>
            </div>
          </div>
        </div>
      ],
      [
        <div className="assignments-create-summary">
          <div className="assignments-create-label clickable-text"
               onClick={this._handlePreview}>
            Preview
          </div>
          <div className="assignments-create-value clickable-text"
               onClick={this._handleAssign}>
            Assign
          </div>
        </div>
      ]
    ];

    return <Tabular className="dark"
      cols={[{content: 'Assignment Summary', width: 250}]}
      rows={rows} />;
  },

  _updateAssignment: function(method, args) {
    args = Array.from(args);
    args.unshift(this.state.theAssignment);
    let theAssignment = assignment[method].apply(null, args);
    this.setState({theAssignment});
  },

  _handleAddTopic: function() {
    this._updateAssignment('addTopic', arguments);
  },

  _handleIncrementTopicCount: function() {
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

  _handlePreview: async function() {
    let {aClass, assignments, theAssignment, isPracticeMode} = this.state;
    theAssignment = await assignment.getPreview(theAssignment);
    this.setState({theAssignment});

    let cols = [
      {content: '', width: 100},
      {content: '', width: 460}
    ];

    let {preview, created, deadline} = theAssignment;
    let rows = preview.map((question, index) => {
      return [`${index + 1}.`, question.question];
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

  _handleAssign: async function() {
    let {aClass, assignments, theAssignment} = this.state;
    await assignment.assign(aClass, assignments, theAssignment);
    location.hash = `#!/classes/${this.props.aClass}/`;
  },

  _handleStart: async function() {
    let {assignments, theAssignment} = this.state;
    let practiceId = await assignment.practice(assignments, theAssignment);
    location.hash = `#!/practice/${practiceId}/edit/`;
  }
});
