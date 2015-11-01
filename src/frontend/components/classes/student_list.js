let $ = document.querySelector.bind(document);
let Firebase = require('firebase/lib/firebase-web');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../tabular');
let Topbar = require('../topbar');
let debug = console.log.bind(console, '[components/classes/student_list]');
let session = require('../../session');
let classes = require('../../store/classes');
let handleEnter = require('../../handle_enter');

let studentsRef = new Firebase('https://mathleap.firebaseio.com/students');

module.exports = React.createClass({
  displayName: 'classes/student_list',

  mixins: [ReactFire],

  getInitialState: function() {
    return {
      user: session.get('user'),
      classes: [],
      classIds: []
    };
  },

  componentWillMount: function() {
    let student = this.state.user;
    session.on('user', this._onUser);
    this.bindAsArray(
      studentsRef
        .child(btoa(student.email))
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

  componentWillUnmount: function() {
    session.removeListener('user', this._onUser);
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
    let student = this.state.user;
    let headerText = `${student.first}'s Classes`;
    let classList = this.state.classes
      .filter(aClass => !!aClass)
      .map(aClass => {
        return [
           <div className="class-details">
             <div className="class-color"
                  style={{backgroundColor: aClass.color}}>
             </div>
             <div className="clickable-text"
                  onClick={this._handleShowClass.bind(this, aClass)}>
               {aClass.name}
             </div>
           </div>,
          `${aClass.teacher.title} ${aClass.teacher.last}`,
          ''
        ];
      });

    return <div id="classes-student-list">
      <Topbar headerText={headerText} />
      <Tabular className="view"
               cols={[
                 {content: 'Class', width: 660},
                 {content: 'Teacher', width: 165},
                 {
                   content: <img className="list-action-btn"
                                 src="style/images/add_btn.png"
                                 onClick={this._handleAddClass} />,
                   align: 'right',
                   width: 165
                 }
               ]}
               rows={classList} />

    </div>;
  },

  _onUser: function(user) {
    this.setState({user});
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

  _handleShowClass: function(aClass) {
    debug('show class');
    location.hash = `#!/classes/${aClass.id}/`;
  },

  _handleAddClassSubmit: async function() {
    debug('add class submit');
    let code = $('.join-class-code').value;
    await classes.join(code);
    this.props.closeModal();
  }
});
