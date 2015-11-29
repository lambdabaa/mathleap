/**
 * @fileoverview Assignment generator.
 */
let ClassCode = require('../ClassCode');
let Firebase = require('firebase/lib/firebase-web');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let bridge = require('../../bridge');
let classes = require('../../store/classes');
let colors = require('../../colors');
let debug = console.log.bind(console, '[components/assignments/create]');
let {firebaseUrl} = require('../../constants');
let moment = require('moment');

module.exports = React.createClass({
  displayName: 'assignments/Create',

  mixins: [ReactFire],

  getInitialState: function() {
    let deadline = moment();
    deadline.date(deadline.date() + 1);

    return {
      aClass: {},
      topics: [],
      topic: null,
      composition: [],
      deadline,
      preview: null,
      assignments: []
    };
  },

  componentWillMount: async function() {
    let id = this.props.aClass;
    this.bindAsArray(
      new Firebase(`${firebaseUrl}/topics`),
      'topics'
    );

    this.bindAsArray(
      new Firebase(`${firebaseUrl}/classes/${id}/assignments`),
      'assignments'
    );

    let aClass = await classes.get(id);
    this.setState({aClass});
  },

  render: function() {
    let {aClass} = this.state;

    let headerText = <div className="classes-show-header">
      <div className="classes-show-header-title"
           style={{color: aClass.color}}>
        {aClass.name}
      </div>
      <ClassCode code={aClass.code} />
    </div>;

    return <div id="assignments-create">
      <Topbar headerText={headerText} />
      <div className="view">
        <div className="backlink clickable-text" onClick={this._handleBack}>
          &lt; {aClass && aClass.name}
        </div>
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
    let {composition} = this.state;
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
    let {composition, deadline} = this.state;
    let count = composition.reduce((sum, part) => sum + part.count, 0);

    let chart = <div className="topic-ratio-chart">
      {
        composition.map((part, index) => {
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

  _handleAddTopic: function(topic, type) {
    debug('add topic', JSON.stringify(topic), JSON.stringify(type));
    let {composition} = this.state;
    let color = colors.random();
    composition.push({topic, type, color, count: 1});
    this.setState({topic: null, preview: null, composition});
  },

  _handleIncrementTopicCount: function(index) {
    debug('increment topic count', index);
    let {composition} = this.state;
    composition[index].count += 1;
    this.setState({preview: null, composition});
  },

  _handleDecrementTopicCount: function(index) {
    debug('decrement topic count', index);
    let {composition} = this.state;
    composition[index].count -= 1;
    if (composition[index].count === 0) {
      composition.splice(index, 1);
    }

    this.setState({preview: null, composition});
  },

  _handleIncrementDeadline: function() {
    debug('increment deadline');
    let {deadline} = this.state;
    deadline.date(deadline.date() + 1);
    this.setState({deadline});
  },

  _handleDecrementDeadline: function() {
    debug('decrement deadline');
    let {deadline} = this.state;
    deadline.date(deadline.date() - 1);
    this.setState({deadline});
  },

  _handlePreview: async function() {
    debug('preview assignment');
    let {aClass, assignments, deadline, preview} = this.state;
    if (!preview) {
      preview = await bridge('createAssignment', this.state.composition);
      this.setState({preview});
    }

    let cols = [
      {content: '', width: 100},
      {content: '', width: 460}
    ];

    let rows = preview.map((question, index) => {
      return [`${index + 1}.`, question.question];
    });

    this.props.showModal(
      <div className="assignment-preview">
        <div className="assignment-details">
          <div className="assignment-name"
               style={{color: aClass.color}}>
            {`Assignment ${assignments.length + 1}`}
          </div>
          <div className="class-code">
            <div className="class-code-key">Deadline</div>
            <div className="class-code-value">
              {deadline.format('dddd, MMM Do YYYY')}
            </div>
          </div>
        </div>
        <Tabular cols={cols} rows={rows} />
      </div>
    );
  },

  _handleAssign: async function() {
    debug('create assignment');
    let {aClass, assignments, composition, deadline, preview} = this.state;
    if (!preview) {
      preview = await bridge('createAssignment', composition);
    }

    await classes.createAssignment(aClass, {
      name: `Assignment ${assignments.length + 1}`,
      deadline: deadline.format('MM/DD/YY'),
      questions: preview
    });

    this._handleBack();
  },

  _handleBack: function() {
    location.hash = `#!/classes/${this.props.aClass}/`;
  }
});
