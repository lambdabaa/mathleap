let React = require('react');
let session = require('../session');
let users = require('../store/users');

module.exports = React.createClass({
  displayName: 'topbar',

  render: function() {
    return <div className="topbar">
      <div className="topbar-logo" onClick={this._handleLogoClick} />
      {
        this.props.headerText ?
          <div className="topbar-header-text">
            {this.props.headerText}
          </div> :
          <div className="topbar-text-logo">
            <div className="topbar-text-logo-math">Math</div>
            <div className="topbar-text-logo-leap">Leap</div>
          </div>
      }
      <div className="topbar-actions">
        {
          this.props.actions ||
          <div className="topbar-action clickable-text" onClick={users.logout}>
            Log out
          </div>
        }
      </div>
    </div>
  },

  _handleLogoClick: function() {
    let user = session.get('user');
    location.hash = `#!/${user ? 'classes' : 'home'}/`;
  }
});
