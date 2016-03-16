/* @flow */

let KaTeXContainer = require('../KaTeXContainer');
let React = require('react');

function ROTextInputResponse(props: Object): React.Element {
  let {responses, num} = props;
  let response = responses[num];
  let {work} = response;
  let answer = work.length > 1 ? work[work.length - 1].state[0] : '';
  return <KaTeXContainer ascii={answer} />;
}

module.exports = ROTextInputResponse;
