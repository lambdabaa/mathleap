let React = require('react');
let querystring = require('querystring');
let users = require('../store/users');

module.exports = React.createClass({
  displayName: 'EdmodoHandler',

  componentDidMount: function() {
    let auth = querystring.parse(location.hash.substring(1));
    if ('error' in auth) {
      // Ruh roh
      location.hash = '#!/home/';
      return;
    }

    users.edmodo(auth);
  },

  render: function() {
    return <div></div>;
  }
});
