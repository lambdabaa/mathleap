let $ = document.querySelector.bind(document);
let Firebase = require('firebase/lib/firebase-web');
let React = require('react');
let ReactFire = require('reactfire');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let classes = require('../../store/classes');
let debug = console.log.bind(console, '[components/classes/TeacherList]');
let {getPalette} = require('../../colors');
let handleEnter = require('../../handleEnter');
let session = require('../../session');

let classesRef = new Firebase('https://mathleap.firebaseio.com/classes');

module.exports = React.createClass({
  displayName: 'classes/TeacherList',

  mixins: [ReactFire],

  getInitialState: function() {
    return {
      user: session.get('user'),
      classes: [],
      editable: null
    };
  },

  componentWillMount: function() {
    let teacher = this.state.user;
    this.bindAsArray(
      classesRef
        .orderByChild('teacher')
        .equalTo(teacher.uid),
      'classes'
    );

    session.on('user', this._onUser);
  },

  componentWillUnmount: function() {
    session.removeListener('user', this._onUser);
  },

  render: function() {
    let teacher = this.state.user;
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
    </div>;
  },

  _onUser: function(user) {
    this.setState({user});
  },

  _renderMutableClass: function(aClass, index) {
    let editable = this.state.editable;
    return <div className="class-details">
      {
        editable.field === 'color' &&
        <div className="class-color-picker">
          <img className="class-color-picker-expand"
               src="style/images/color_picker_triangle.png" />
          <div className="class-color-picker-matrix">
            {
              getPalette(8).map((row, index) => {
                return <div key={index} className="class-color-picker-row">
                  {
                    row.map(color => {
                      return <div key={color}
                                  className="class-color-picker-choice"
                                  style={{backgroundColor: color}}
                                  onClick={this._handleChangeColor.bind(this, aClass, color)}>
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
                 onKeyDown={handleEnter(this._handleChangeName.bind(this, aClass))}
                 onBlur={this._handleChangeName.bind(this, aClass)} /> :
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
      <div className="clickable-text"
           onClick={this._handleShowClass.bind(this, aClass)}>
        {aClass.name}
      </div>
      <img className="list-action-btn"
           src="style/images/edit_btn.png"
           onClick={this._handleEditClass.bind(this, index, 'name')} />
    </div>;
  },

  _handleShowClass: function(aClass) {
    debug('show class', JSON.stringify(aClass));
    if (this.state.editable !== null) {
      this.setState({editable: null});
    }

    location.hash = `#!/classes/${aClass['.key']}/`;
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
    await classes.update(aClass['.key'], details);
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

    return classes.remove(aClass['.key']);
  }
});
