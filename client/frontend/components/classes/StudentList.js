/* @flow */

let React = require('react');
let Tabular = require('../Tabular');
let Topbar = require('../Topbar');
let format = require('../../helpers/format');
let users = require('../../store/users');

function StudentList(props: Object): React.Element {
  let {first, classes} = props;
  let headerText = first && first.length ? `${first}'s Classes` : 'My Classes';
  let classList = classes
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
    <div className="view classes-list-ftu">
      {
        classList.length ?
          'Click on a class to take assignments and see your submissions.' :
          `Welcome to MathLeap! To join a class, click the plus sign below
           and enter your class code. If you just want to practice, click
           Practice Mode on the navigation bar.`
      }
    </div>
    <Tabular className="view"
             cols={[
               {content: 'Class', width: 660},
               {content: 'Teacher', width: 165},
               {
                 content: <img className="list-action-btn"
                               src="public/style/images/add_btn.png"
                               onClick={props.addClass} />,
                 align: 'right',
                 width: 165
               }
             ]}
             rows={classList} />
  </div>;
}

module.exports = StudentList;
