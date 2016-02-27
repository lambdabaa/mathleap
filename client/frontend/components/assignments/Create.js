/* @flow */
/**
 * @fileoverview Assignment generator.
 */

let KaTeXContainer = require('../KaTeXContainer');
let Moment = require('moment');
let ClassCode = require('../ClassCode');
let React = require('react');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let assignment = require('../../helpers/assignment');

module.exports = function(props: Object): React.Element {
  let {aClass, classId, isPracticeMode, isTopicAdded} = props;
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
    backlink = `#!/classes/${classId}/`;
    backlinkText = <span>&lt; {aClass && aClass.name}</span>;
  }

  return <div id="assignments-create">
    <div className={`add-topic-flash ${isTopicAdded || 'hidden'}`}>✔ Assignment updated</div>
    <Topbar headerText={headerText} />
    <div className="view">
      <a className="backlink clickable-text" href={backlink}>{backlinkText}</a>
      <div className="assignments-create-level">
        {renderTopics(props)}
        {renderQuestionTypes(props)}
      </div>
      <div className="assignments-create-level">
        {renderAssignmentComposition(props)}
        {renderAssignmentSummary(props)}
      </div>
    </div>
  </div>;
};

function renderTopics(props: Object): React.Element {
  let {topic, topics} = props;
  let selected = -1;
  let rows = topics.map(function(aTopic: Object, index: number): Array<React.Element> {
    // Highlight the selected topic.
    if (topic && topic.name === aTopic.name) {
      selected = index;
    }

    return [
      <div className="clickable-text" onClick={() => props.setTopic(aTopic)}>
        {aTopic.name}
      </div>
    ];
  });

  return <Tabular className="dark"
    cols={[{content: 'Topics', width: 350}]}
    rows={rows}
    selected={selected} />;
}

function renderQuestionTypes(props: Object): React.Element {
  let cols = [
    {content: 'Question Type', width: 260},
    {content: 'Example', width: 260, align: 'center'},
    {content: '', width: 30, align: 'right'}
  ];

  let {topic} = props;
  let rows = topic ?
    topic.types.map((aType: Object): Array<React.Element | string> => {
      let fontSize;
      switch (aType.name) {
        case 'Differing polynomial coefficients':
          fontSize = '12px';
          break;
        default:
          fontSize = '14px';
          break;
      }

      let example;
      if (topic.name === 'Expressions with variables') {
        example = aType.example;
      } else {
        example = <KaTeXContainer ascii={aType.example}
                                  style={{fontSize, textAlign: 'center !important'}} />;
      }

      return [
        aType.name,
        example,
        <img className="list-action-btn"
             src="public/style/images/add_btn.png"
             onClick={() => props.addTopic(topic, aType)} />
      ];
    }) :
    [];

  return <Tabular className="dark"
    cols={cols}
    rows={rows} />;
}

function renderAssignmentComposition(props: Object): React.Element {
  let {composition} = props.theAssignment;
  let rows = composition.map(function(part: Object, index: number): Object {
    let increment = props.incrementTopicCount.bind(null, index);
    let decrement = props.decrementTopicCount.bind(null, index);
    return {
      content: [
        part.topic.name,
        part.type.name,
        <div className="composition-incrementable">
          {part.count}
          <div className="composition-increment-container">
            <img className="list-action-btn"
                 src="public/style/images/increase_btn.png"
                 onClick={increment}/>
            <img className="list-action-btn"
                 src="public/style/images/decrease_btn.png"
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
}

function renderAssignmentSummary(props: Object) {
  return props.isPracticeMode ?
    renderPracticeSummary(props) :
    renderRealSummary(props);
}

function generateChart(props: Object) {
  let count = questionCount(props);
  return <div className="topic-ratio-chart">
    {
      props.theAssignment.composition.map((part, index) => {
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
}

function questionCount(props: Object): number {
  return assignment.getSize(props.theAssignment);
}

function getDeadline(props: Object): Moment {
  return props.theAssignment.deadline;
}

function renderPracticeSummary(props: Object): React.Element {
  let chart = generateChart(props);
  let count = questionCount(props);
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
        <div className="assignments-create-label button" onClick={props.preview}>
          Preview
        </div>
        <div className="assignments-create-value button-inverse" onClick={props.start}>
          Start
        </div>
      </div>
    ]
  ];

  return <Tabular className="dark"
    cols={[{content: 'Practice Summary', width: 250}]}
    rows={rows} />;
}

function renderRealSummary(props: Object): React.Element {
  let chart = generateChart(props);
  let count = questionCount(props);
  let deadline = getDeadline(props);

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
                   src="public/style/images/increase_btn.png"
                   onClick={props.incrementDeadline}/>
              <img className="list-action-btn"
                   src="public/style/images/decrease_btn.png"
                   onClick={props.decrementDeadline} />
            </div>
          </div>
        </div>
      </div>
    ],
    [
      <div className="assignments-create-summary">
        <div className="assignments-create-label button" onClick={props.preview}>
          Preview
        </div>
        <div className="assignments-create-value button-inverse" onClick={props.assign}>
          Assign
        </div>
      </div>
    ]
  ];

  return <Tabular className="dark"
    cols={[{content: 'Assignment Summary', width: 250}]}
    rows={rows} />;
}
