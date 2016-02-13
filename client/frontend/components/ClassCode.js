/* @flow */

let React = require('react');

module.exports = function({code}: {code: string}): React.Element {
  return <div className="class-code">
    <div className="class-code-key">class code</div>
    <div className="class-code-value">{code}</div>
  </div>;
};
