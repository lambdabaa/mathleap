let React = require('react');

module.exports = React.createClass({
  displayName: 'ClassCode',

  render: function() {
    return <div className="class-code">
      <div className="class-code-key">class code</div>
      <div className="class-code-value">{this.props.code}</div>
    </div>;
  }
});
