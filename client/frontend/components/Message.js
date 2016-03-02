/* @flow */

let React = require('react');

module.exports = function(props: Object): React.Element {
  return <div className="big-message">
    {props.message || ''}
  </div>;
};
