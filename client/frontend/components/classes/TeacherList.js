/* @flow */

let React = require('react');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let {getPalette} = require('../../colors');
let handleEnter = require('../../handleEnter');

function TeacherList(props: Object): React.Element {
  let {teacher, classes, editable, isClipboardSuccess} = props;
  let headerText = `${teacher.title} ${teacher.last}'s Classes`;

  let cols = [
    {content: 'Class', width: 620},
    {content: 'Code', width: 155},
    {content: 'Students', width: 77.5},
    {
      content: <div className="button-action try-it-button tabular-button"
                    onClick={props.addClass}>
        + Class
      </div>,
      align: 'center',
      width: 137.5
    }
  ];

  let rows = classes.map((aClass: Object, index: number): Array<React.Element> => {
    return [
      ((): React.Element => {
        return editable && editable.index === index ?
          renderMutableClass(props, aClass, index) :
          renderImmutableClass(props, aClass, index);
      })(),
      <div className="classes-list-clipboard-container">
        <div className="copy-to-clipboard" data-clipboard-text={aClass.code}></div>
        <div id={aClass.code}>{aClass.code}</div>
      </div>,
      aClass.students ? Object.keys(aClass.students).length : 0,
      <img className="list-action-btn"
           src="public/style/images/delete_btn.png"
           onClick={() => props.deleteClass(aClass)} />
    ];
  });

  return <div id="classes-teacher-list">
    <div className={`add-topic-flash ${isClipboardSuccess || 'hidden'}`}>
      ✔ Code copied to clipboard
    </div>
    <Topbar headerText={headerText}
            showModal={props.showModal}
            displayModalError={props.displayModalError}
            displayModalSuccess={props.displayModalSuccess}
            clearMessages={props.clearMessages} />
    <div className="view classes-list-ftu">
      {
        rows.length ?
          'Click on a class to create assignments and view submissions.' :
          'Welcome to MathLeap! To create a class, click the plus button below.'
      }
    </div>
    <Tabular className="view" cols={cols} rows={rows} />
  </div>;
}

function renderMutableClass(props: Object, aClass: Object,
                            index: number): React.Element {
  let {editable} = props;
  let changeName = props.changeName.bind(null, aClass);
  return <div className="class-details">
    {
      editable.field === 'color' &&
      <div className="class-color-picker">
        <img className="class-color-picker-expand"
             src="public/style/images/color_picker_triangle.png" />
        <div className="class-color-picker-matrix">
          {
            getPalette(8).map((row, rowIndex) => {
              return <div key={rowIndex} className="class-color-picker-row">
                {
                  row.map(color => {
                    return <div key={color}
                                className="class-color-picker-choice"
                                style={{backgroundColor: color}}
                                onClick={() => props.changeColor(aClass, color)}>
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
         onClick={() => props.editClass(index, 'color')}>
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
}

function renderImmutableClass(props: Object, aClass: Object,
                              index: number): React.Element {
  return <div className="class-details">
    <div className="class-color"
         style={{backgroundColor: aClass.color}}
         onClick={() => props.editClass(index, 'color')}>
    </div>
    <a className="clickable-text" href={`#!/classes/${aClass.id}/`}>
      {aClass.name}
    </a>
    <img className="list-action-btn"
         src="public/style/images/edit_btn.png"
         onClick={() => props.editClass(index, 'name')} />
    </div>;
}

module.exports = TeacherList;
