/* @flow */

let React = require('react');

function Message(props: Object): React.Element {
  return <div className="big-message">
    {props.message || ''}
  </div>;
}

module.exports = Message;
