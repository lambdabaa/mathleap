/* @flow */

let $ = document.querySelector.bind(document);
let React = require('react');
let debug = require('../../common/debug')('Topbar');
let helper = require('../helpers/user');
let session = require('../session');
let users = require('../store/users');

function Topbar(props: Object): React.Element {
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
        (() => {
          let actions = [
            <div className="topbar-action clickable-text" onClick={users.logout}>
              Log out
            </div>
          ];

          if (helper.isTeacher() && !helper.isEdmodoUser()) {
            actions.unshift(
              <div className="topbar-action clickable-text" onClick={handleAccount.bind(this, props, user)}>
                Account
              </div>
            );
          }

          return actions;
        })()
      }
    </div>
  </div>;
}

async function handleAccount(props: Object, user: Object): Promise {
  debug('account settings');
  props.clearMessages();
  await props.showModal(
    <div className="update-password-form">
      <input type="password" className="old-password" placeholder="Current password or reset token" />
      <input type="password" className="new-password" placeholder="New password" />
      <input type="password" className="new-password-check" placeholder="Repeat password" />
      <div className="change-password-submit button-inverse"
           onClick={onChangePassword.bind(this, props, user)}>
        Change password
      </div>
    </div>
  );

  $('.old-password').focus();
}

async function onChangePassword(props: Object, user: Object): Promise {
  let {prev, next, check} = getPasswordData();
  if (next !== check) {
    return props.displayModalError('Passwords do not match.');
  }

  try {
    await users.changePassword({
      email: user.email,
      oldPassword: prev,
      newPassword: next
    });
  } catch (error) {
    return props.displayModalError(error.message);
  }

  props.displayModalSuccess('Password updated successfully.');
}

function getPasswordData(): Object {
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let prev = $('.old-password').value;
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let next = $('.new-password').value;
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let check = $('.new-password-check').value;
  return {prev, next, check};
}

module.exports = Topbar;
