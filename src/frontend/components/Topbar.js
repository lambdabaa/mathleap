/* @flow */

let React = require('react');
let session = require('../session');
let users = require('../store/users');

module.exports = function(props: Object): React.Element {
  let user = session.get('user');
  return <div className="topbar">
    <a className="topbar-logo" href={`#!/${user ? 'classes' : 'home'}/`} />
    {
      props.headerText != null ?
        <div className="topbar-header-text">{props.headerText}</div> :
        <div className="topbar-text-logo">
          <div className="topbar-text-logo-math">Math</div>
          <div className="topbar-text-logo-leap">Leap</div>
        </div>
    }
    <div className="topbar-actions">
      {
        props.actions ||
        <div className="topbar-action clickable-text" onClick={users.logout}>
          Log out
        </div>
      }
    </div>
  </div>;
};
