/* @flow */

let Empty = require('./Empty');
let React = require('react');
let {renderToString} = require('katex');

module.exports = function(props: Object): React.Element {
  let {tex} = props;
  if (typeof tex !== 'string') {
    return <Empty />;
  }

  let html = renderToString(tex);
  return React.createElement(
    'div',
    Object.assign(
      {},
      props,
      {
        className: 'katex-container unselectable',
        dangerouslySetInnerHTML: {__html: html}
      }
    )
  );
};
