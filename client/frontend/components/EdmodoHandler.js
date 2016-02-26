/* @flow */

let Empty = require('./Empty');
let React = require('react');
let querystring = require('querystring');
let users = require('../store/users');

class EdmodoHandler extends React.Component {
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

    users.edmodo(auth);
  }

  render(): React.Element {
    return <Empty />;
  }
}

module.exports = EdmodoHandler;
