/* @flow */

let React = require('react');
let times = require('lodash/utility/times');

module.exports = function(props: Object): React.Element {
  let {carousel} = props;
  let screens = getScreens();
  let screen = screens[carousel];

  return <div className="submissions-edit-tutorial">
    <div className="modal-exit" onClick={props.dismiss}>x</div>
    <div className="submissions-edit-tutorial-text">
      {screen}
    </div>
    <div className="submissions-edit-tutorial-dots">
      {
        times(screens.length, (index: number): React.Element => {
          let className = 'carousel-dot';
          if (index === carousel) {
            className += ' active';
          }

          return <span key={index}
                       className={className}
                       onClick={props.setCarousel.bind(props, index)}>
            &#8729;
          </span>;
        })
      }
    </div>
  </div>;
};

function getScreens(): Array<React.Element> {
  return [
    <div className="carousel">
      Open a problem by selecting it from the question list on the left.
      There are two columns: <span className="emph">History</span>
      and <span className="emph">Results</span>.
      The <span className="emph">History</span> column shows the operations
      you performed at a given step.
      The <span className="emph">Results</span> column shows your progress
      at a given step in the problem.
    </div>,
    <div className="carousel">
      The problem editor allows three primary operations:
      <span style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>both sides</span>,
      <span style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>replace</span>, and
      <span style={{backgroundColor: 'rgba(226, 37, 23, 0.5)'}}>cancel</span>.
    </div>,
    <div className="carousel">
      To perform a <span style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>both sides</span>
      operation, simply type the operator
      (ie <span className="emph">+ </span>,
          <span className="emph">- </span>,
          <span className="emph">* </span>,
          <span className="emph">/ </span>,
          <span className="emph">^</span>) followed by the expression.
      For instance, typing <span style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>*10</span>
      multiplies each side by 10.
    </div>,
    <div className="carousel">
      To perform a <span style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>replace</span>
      operation, highlight an expression like <span className="emph">2(x+1)</span>
      and then type the replacement (perhaps <span className="emph">2x+2</span>).
    </div>,
    <div className="carousel">
      To perform a <span style={{backgroundColor: 'rgba(226, 37, 23, 0.5)'}}>cancel</span>.
      operation, highlight an expression like <span className="emph">x-x</span>
      and then hit the backspace or delete character on your keyboard.
    </div>,
    <div className="carousel">
      You can move around the
      <span style={{color: '#3996f0', fontSize: '24px', fontWeight: 'bold'}}>|</span>
      cursor by clicking within the equation or using the ← and → keys.
      Highlight expressions by clicking and dragging your mouse or with shift ←  and shift → .
    </div>,
    <div className="carousel">
      Learn about more keyboard shortcuts by clicking the <span className="emph">?</span> icon.
    </div>
  ];
}
