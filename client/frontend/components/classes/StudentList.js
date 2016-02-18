let $ = document.querySelector.bind(document);
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let debug = require('../../../common/debug')('components/classes/StudentList');
let format = require('../../helpers/format');
let session = require('../../session');
let classes = require('../../store/classes');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');
let handleEnter = require('../../handleEnter');
let users = require('../../store/users');

let studentsRef = createSafeFirebaseRef('students');

module.exports = React.createClass({
  displayName: 'classes/StudentList',

  mixins: [ReactFire],

  getInitialState: function() {
    return {
      classes: [],
      classIds: []
    };
  },

  componentWillMount: function() {
    let student = session.get('user');
    this.bindAsArray(
      studentsRef
        .child(student.id)
        .child('classes'),
      'classIds'
    );
  },

  componentDidMount: function() {
    this._updateClasses(this.state);
  },

  componentWillUpdate: function(props, state) {
    let clean =
      state.classIds.length === state.classes.length &&
      state.classes.every((aClass, index) => {
        return aClass ?
          aClass.id === state.classIds[index]['.value'] :
          true;
      });

    if (clean) {
      return;
    }

    this._updateClasses(state);
  },

  _updateClasses: async function(state) {
    // ReactFire keeps the list of classIds which we're taking up-to-date
    // but it's our job to turn those into actual classes.
    let ids = state.classIds.map(obj => obj['.value']);
    let update = await Promise.all(
      ids.map(id => classes.get(id, {include: ['teacher']}))
    );

    this.setState({classes: update});
  },

  render: function() {
    let {first} = session.get('user');
    let headerText = first && first.length ? `${first}'s Classes` : 'My Classes';
    let classList = this.state.classes
      .filter(aClass => !!aClass)
      .map(aClass => {
        return [
           <div className="class-details">
             <div className="class-color"
                  style={{backgroundColor: aClass.color}}>
             </div>
             <a className="clickable-text"
                href={`#!/classes/${aClass.id}/`}>
               {aClass.name}
             </a>
           </div>,
           format.teacher(aClass.teacher),
          ''
        ];
      });

    return <div id="classes-student-list">
      <Topbar headerText={headerText}
              actions={[
                <a className="topbar-action clickable-text" href="#!/practice/">Practice Mode</a>,
                <div className="topbar-action clickable-text"
                     onClick={users.logout}>
                  Log out
                </div>
              ]} />
      <Tabular className="view"
               cols={[
                 {content: 'Class', width: 660},
                 {content: 'Teacher', width: 165},
                 {
                   content: <img className="list-action-btn"
                                 src="public/style/images/add_btn.png"
                                 onClick={this._handleAddClass} />,
                   align: 'right',
                   width: 165
                 }
               ]}
               rows={classList} />
      {
        classList.length ?
          '' :
          <div className="view classes-list-ftu">
            Welcome to MathLeap! To join a class with a student code, click
            the plus sign in the upper right corner. If you just want to practice,
            click Practice Mode on the navigation bar.
          </div>
      }
    </div>;
  },

  _handleAddClass: async function() {
    debug('add class');
    await this.props.showModal(
      <div className="join-class-form">
        <input type="text" className="join-class-code" placeholder="Class code"
               onKeyDown={handleEnter(this._handleAddClassSubmit)} />
        <div className="join-class-submit button-inverse"
             onClick={this._handleAddClassSubmit}>
          Join
        </div>
      </div>
    );

    $('.join-class-code').focus();
  },

  _handleAddClassSubmit: async function() {
    debug('add class submit');
    let code = $('.join-class-code').value;
    await classes.join(code);
    this.props.closeModal();
  }
});
