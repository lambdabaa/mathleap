/* @flow */

let $ = document.querySelector.bind(document);
let React = require('react');
let ReactFire = require('reactfire');
let StudentList = require('./StudentList');
let classes = require('../../store/classes');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');
let debug = require('../../../common/debug')('components/classes/StudentListContainer');
let handleEnter = require('../../handleEnter');
let session = require('../../session');

let studentsRef = createSafeFirebaseRef('students');

module.exports = React.createClass({
  displayName: 'classes/StudentList',

  mixins: [ReactFire],

  getInitialState: function(): Object {
    return {
      first: '',
      classes: [],
      classIds: []
    };
  },

  componentWillMount: function(): void {
    let student = session.get('user');
    this.bindAsArray(
      studentsRef
        .child(student.id)
        .child('classes'),
      'classIds'
    );

    this.setState({first: student.first});
  },

  componentDidMount: function() {
    this._updateClasses(this.state);
    this.props.onload();
  },

  componentWillUpdate: function(props: Object, state: Object): void {
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

  _updateClasses: async function(state: Object): Promise<void> {
    // ReactFire keeps the list of classIds which we're taking up-to-date
    // but it's our job to turn those into actual classes.
    let ids = state.classIds.map(obj => obj['.value']);
    let update = await Promise.all(
      ids.map(id => classes.get(id, {include: ['teacher']}))
    );

    this.setState({classes: update});
  },

  render: function(): React.Element {
    return <StudentList first={this.state.first}
                        classes={this.state.classes}
                        addClass={this._handleAddClass} />;
  },

  _handleAddClass: async function(): Promise<void> {
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

  _handleAddClassSubmit: async function(): Promise<void> {
    debug('add class submit');
    // $FlowFixMe
    let code = $('.join-class-code').value;
    await classes.join(code);
    this.props.closeModal();
  }
});
