/* @flow */

let React = require('react');

module.exports = function(props: Object): React.Element {
  return <div id="outer-container">
    {
      props.modal &&
      <div className="overlay" onClick={props.clickOverlay}>
        <div className="modal">
          <div className="modal-header">
            <div className="modal-logo"></div>
            <div className="modal-exit" onClick={props.closeModal}>x</div>
          </div>
          <div className="modal-body">
            {
              props.errorMessage &&
              <div className="modal-error">
                {props.errorMessage}
              </div>
            }
            {props.modal}
          </div>
        </div>
      </div>
    }
    <div id="inner-container">{props.route.element}</div>
  </div>;
};
