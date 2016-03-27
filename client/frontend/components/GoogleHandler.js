/* @flow */

let Message = require('./Message');
let React = require('react');
let querystring = require('querystring');
let users = require('../store/users');

class GoogleHandler extends React.Component {
  constructor(props: Object) {
    super(props);
  }

  componentDidMount(): void {
    let auth = querystring.parse(location.hash.substring(1));
    if ('error' in auth) {
      // Ruh roh
      location.hash = '#!/home/';
      return;
    }

    users.google(auth);
  }

  render(): React.Element {
    return <Message message="Loading account..." />;
  }
}

module.exports = GoogleHandler;
