/* @flow */

let React = require('react');

function NotFound(): React.Element {
  return <div id="not-found">
    <div className="container">
      <div className="text">
        <div className="text-header">404</div>
        <div className="text-tagline">Oops! Where are we?</div>
        <div className="text-body">
          MathLeap is a feedback and assessments platform for math classes.
          Click the button below to learn more!
        </div>
        <a className="not-found-button" href="https://mathleap.org">Go home</a>
      </div>
      <div className="mascot"></div>
    </div>
  </div>;
}

module.exports = NotFound;
