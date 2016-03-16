/* @flow */

let $ = document.querySelector.bind(document);
let React = require('react');
let ReactFire = require('reactfire');
let TeacherList = require('./TeacherList');
let classes = require('../../store/classes');
let createSafeFirebaseRef = require('../../createSafeFirebaseRef');
let debug = require('../../../common/debug')('components/classes/TeacherListContainer');
let preloadImage = require('../../preloadImage');
let session = require('../../session');
let stringify = require('../../../common/stringify');

let teachersRef = createSafeFirebaseRef('teachers');

module.exports = React.createClass({
  displayName: 'classes/TeacherList',

  mixins: [ReactFire],

  getInitialState: function(): Object {
    return {
      classes: [],
      classIds: [],
      editable: null
    };
  },

  componentWillMount: function(): void {
    let teacher = session.get('user');
    this.bindAsArray(
      teachersRef
        .child(teacher.id)
        .child('classes'),
      'classIds'
    );
  },

  componentDidMount: function(): void {
    this._updateClasses(this.state);
    preloadImage('public/style/images/color_picker_triangle.png');
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
    let update = await Promise.all(ids.map(classes.get));
    this.setState({classes: update});
  },

  componentDidUpdate: function(props: Object, state: Object): void {
    let prev = state.editable;
    let curr = this.state.editable;
    if (prev != null || curr == null || curr.field !== 'name') {
      // We should only focus if
      //
      // 1. we just started editing
      // 2. we are editing
      // 3. we're editing the nam
      return;
    }

    $('.classes-list-edit-class-name').focus();
  },

  render: function(): React.Element {
    return <TeacherList teacher={session.get('user')}
                        classes={this.state.classes}
                        editable={this.state.editable}
                        showModal={this.props.showModal}
                        displayModalError={this.props.displayModalError}
                        displayModalSuccess={this.props.displayModalSuccess}
                        clearMessages={this.props.clearMessages}
                        addClass={this._handleAddClass}
                        editClass={this._handleEditClass}
                        changeName={this._handleChangeName}
                        changeColor={this._handleChangeColor}
                        deleteClass={this._handleDeleteClass} />;
  },

  _handleAddClass: function(): Promise<Object> {
    debug('add class');
    if (this.state.editable !== null) {
      this.setState({editable: null});
    }

    return classes.create();
  },

  _handleEditClass: function(index: number, field: string): void {
    debug('edit class', index, field);
    this.setState({editable: {index, field}});
  },

  _handleChangeName: function(aClass: Object): Promise<void> {
    // $FlowFixMe
    let name = $('.classes-list-edit-class-name').value;
    return this._updateClass(aClass, {name});
  },

  _handleChangeColor: function(aClass: Object, color: string): Promise<void> {
    return this._updateClass(aClass, {color});
  },

  _updateClass: async function(aClass: Object, details: Object): Promise<void> {
    debug('update class', stringify(aClass), stringify(details));
    await classes.update(aClass.id, details);
    await this._updateClasses(this.state);
    this.setState({editable: null});
  },

  _handleDeleteClass: function(aClass: Object): Promise<void> {
    debug('delete class', stringify(aClass));
    if (this.state.editable !== null) {
      this.setState({editable: null});
    }

    if (!window.confirm(`Are you sure you want to delete ${aClass.name}?`)) {
      return Promise.resolve();
    }

    return classes.remove(aClass.id);
  }
});
