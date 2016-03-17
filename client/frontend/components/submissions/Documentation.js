/* @flow */

let React = require('react');
let Topbar = require('../Topbar');

function Documentation(props: Object): React.Element {
  props.onload();
  return <div id="documentation">
    <Topbar headerText="Introduction to the Math Editor" />
    <div className="view">
      <p>
        MathLeap is different from other online math programs. We encourage students
        to show all of their work so that we can provide personalized feedback.
        The most important thing to understand about editing MathLeap equations
        is that there are <span className="emph">only 2 possible operations</span>
      </p>
      <br />
      <ul>
        <li>applying a function to both sides of a statement</li>
        <li>simplifying an expression within a statement</li>
      </ul>
      <br />
      <p>
        Applying a function to both sides of a statement encompasses operations like
        adding a number to both sides of an equation and taking the logarithm of each
        side of an inequality. Simplifying an expression within a statement includes
        operations like rewriting an expression like
        <span className="emph"
              style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>x + x</span>
        to <span className="emph"
                 style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>2x</span>
        and canceling out terms like
        <span className="emph"
              style={{backgroundColor: 'rgba(266, 37, 23, 0.5)'}}>x - x</span>.
      </p>
      <br />
      <h2>Applying a function to both sides</h2>
      <br />
      <p>
        In order to apply a simple function like <span className="emph">f(x) = x + 5</span>
        to each side of a statement (ie adding 5 to both sides), simply click on the active
        problem and type
        <span className="emph"
              style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>+5</span>. Hit
        <span className="emph">ENTER</span>
        to save your changes. Typing other basic operators like
        <span className="emph">-</span>,
        <span className="emph">*</span>,
        <span className="emph">/</span>, or
        <span className="emph">^</span>
        followed by the desired operand is also supported.
      </p>
      <br />
      <p>
        An important sidenote is that many students are familiar with terminology
        like "combining like terms" and "moving terms between sides".
        In order to move a term from one side to another using MathLeap,
        students can subtract it from each side and then cancel terms.
        For instance, if we had the equation <span className="emph">x + 2 = 10</span>
        and wanted to move the <span className="emph">2</span> to the right, we would apply
        <span className="emph"
              style={{backgroundColor: 'rgba(266, 37, 23, 0.5)'}}>-2</span> to each side to get
        <span className="emph">x + 2 - 2 = 10 - 2</span>. From there we could cancel out the
        expression <span className="emph"
                         style={{backgroundColor: 'rgba(266, 37, 23, 0.5)'}}>2 - 2</span> to get
        <span className="emph">x = 10 - 2</span>.
      </p>
      <br />
      <h2>Simplifying an expression</h2>
      <br />
      <p>
        In order to simplify an expression like
        <span className="emph"
              style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>x + x</span>
        to <span className="emph"
                 style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>2x</span>,
        students can highlight the initial expression
        <span className="emph"
              style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>x + x</span>
        and type <span className="emph">BACKSPACE</span>
        followed by the replacement expression
        <span className="emph"
              style={{backgroundColor: 'rgba(57, 150, 240, 0.5)'}}>2x</span>.
        Hitting <span className="emph">ENTER</span>
        saves the changes made during a step. An expression can be highlighted
        using a keyboard or a mouse on a desktop
        browser. To highlight an expression using the keyboard, position the
        <span style={{color: '#3996f0', fontSize: '24px', fontWeight: 'bold'}}>|</span>
        cursor using the arrow keys ← and →
        and then highlight characters to the left with shift + ←
        or to the right with shift + →.
        Simple clicking and dragging works to highlight an expression using the mouse.
      </p>
      <br />
      <p>
        Canceling terms is even easier. To cancel an expression like
        <span className="emph"
              style={{backgroundColor: 'rgba(266, 37, 23, 0.5)'}}>2 - 2</span>,
        simply highlight it and
        use <span className="emph">BACKSPACE</span>. As in the other operations,
        <span className="emph">ENTER</span> saves your work.
      </p>
    </div>
  </div>;
}

module.exports = Documentation;
