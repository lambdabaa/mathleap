let $ = document.querySelector.bind(document);
let Firebase = require('firebase/lib/firebase-web');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let classes = require('../../store/classes');
let debug = require('../../../common/debug')('components/classes/TeacherList');
let {firebaseUrl} = require('../../constants');
let {getPalette} = require('../../colors');
let handleEnter = require('../../handleEnter');
let session = require('../../session');

let teachersRef = new Firebase(`${firebaseUrl}/teachers`);

module.exports = React.createClass({
  displayName: 'classes/TeacherList',

  mixins: [ReactFire],

  getInitialState: function() {
    return {
      classes: [],
      classIds: [],
      editable: null
    };
  },

  componentWillMount: function() {
    let teacher = session.get('user');
    this.bindAsArray(
      teachersRef
        .child(teacher.id)
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
    let update = await Promise.all(ids.map(classes.get));
    this.setState({classes: update});
  },

  componentDidUpdate: function(props, state) {
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

  render: function() {
    let teacher = session.get('user');
    let headerText = `${teacher.title} ${teacher.last}'s Classes`;

    let cols = [
      {content: 'Class', width: 680},
      {content: 'Code', width: 155},
      {content: 'Students', width: 77.5},
      {
        content: <img className="list-action-btn"
                      src="style/images/add_btn.png"
                      onClick={this._handleAddClass} />,
        align: 'right',
        width: 77.5
      }
    ];

    let rows = this.state.classes.map((aClass, index) => {
      return [
        (() => {
          let editable = this.state.editable;
          return editable && editable.index === index ?
            this._renderMutableClass(aClass, index) :
            this._renderImmutableClass(aClass, index);
        })(),
        aClass.code,
        aClass.students ? Object.keys(aClass.students).length : 0,
        <img className="list-action-btn"
             src="style/images/delete_btn.png"
             onClick={this._handleDeleteClass.bind(this, aClass)} />
      ];
    });

    return <div id="classes-teacher-list">
      <Topbar headerText={headerText} />
      <Tabular className="view" cols={cols} rows={rows} />
      {
        rows.length ?
          '' :
          <div className="view classes-list-ftu">
            Welcome to MathLeap! To create a class, click
            the plus sign in the upper right corner.
          </div>
      }
    </div>;
  },

  _renderMutableClass: function(aClass, index) {
    let editable = this.state.editable;
    let changeName = this._handleChangeName.bind(this, aClass);
    return <div className="class-details">
      {
        editable.field === 'color' &&
        <div className="class-color-picker">
          <img className="class-color-picker-expand"
               src="style/images/color_picker_triangle.png" />
          <div className="class-color-picker-matrix">
            {
              getPalette(8).map((row, rowIndex) => {
                return <div key={rowIndex} className="class-color-picker-row">
                  {
                    row.map(color => {
                      let changeColor = this._handleChangeColor.bind(
                        this,
                        aClass,
                        color
                      );

                      return <div key={color}
                                  className="class-color-picker-choice"
                                  style={{backgroundColor: color}}
                                  onClick={changeColor}>
                      </div>;
                    })
                  }
                </div>;
              })
            }
          </div>
        </div>
      }
      <div className="class-color"
           style={{backgroundColor: aClass.color}}
           onClick={this._handleEditClass.bind(this, index, 'color')}>
      </div>
      {
        editable.field === 'name' ?
          <input className="classes-list-edit-class-name"
                 onClick={event => event.stopPropagation()}
                 onKeyDown={handleEnter(changeName)}
                 onBlur={changeName} /> :
          <div className="clickable-text">{aClass.name}</div>
      }
    </div>;
  },

  _renderImmutableClass: function(aClass, index) {
    return <div className="class-details">
      <div className="class-color"
           style={{backgroundColor: aClass.color}}
           onClick={this._handleEditClass.bind(this, index, 'color')}>
      </div>
      <a className="clickable-text" href={`#!/classes/${aClass.id}/`}>
        {aClass.name}
      </a>
      <img className="list-action-btn"
           src="style/images/edit_btn.png"
           onClick={this._handleEditClass.bind(this, index, 'name')} />
    </div>;
  },

  _handleAddClass: function() {
    debug('add class');
    if (this.state.editable !== null) {
      this.setState({editable: null});
    }

    return classes.create();
  },

  _handleEditClass: function(index, field) {
    debug('edit class', index, field);
    this.setState({editable: {index, field}});
  },

  _handleChangeName: function(aClass) {
    let name = $('.classes-list-edit-class-name').value;
    return this._updateClass(aClass, {name});
  },

  _handleChangeColor: function(aClass, color) {
    return this._updateClass(aClass, {color});
  },

  _updateClass: async function(aClass, details) {
    debug('update class', JSON.stringify(aClass), JSON.stringify(details));
    await classes.update(aClass.id, details);
    await this._updateClasses(this.state);
    this.setState({editable: null});
  },

  _handleDeleteClass: function(aClass) {
    debug('delete class', JSON.stringify(aClass));
    if (this.state.editable !== null) {
      this.setState({editable: null});
    }

    if (!window.confirm(`Are you sure you want to delete ${aClass.name}?`)) {
      return;
    }

    return classes.remove(aClass.id);
  }
});
