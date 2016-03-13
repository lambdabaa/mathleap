/* @flow */

let KaTeXContainer = require('../KaTeXContainer');
let React = require('react');
let Tabular = require('../Tabular');
let editor = require('../../helpers/editor');
let {mapChar} = require('../../../common/string');
let stmt = require('../../../common/stmt');
let stringify = require('../../../common/stringify');
let times = require('lodash/utility/times');

function EquationEditor(props: Object): React.Element {
  let {responses, num, equation, append, cursor, leftParens, rightParens} = props;
  let rows = [];
  let response = responses[num];
  if (response) {
    let {work} = response;
    rows = work.map((step: Object, index: number): Array<React.Element> => {
      // We need a special case for the last row since we need
      // to apply the outstanding (uncommitted) changes.
      if (index === work.length - 1) {
        return [
          renderChanges(props, step.state[0], props.changes, append, leftParens, rightParens),
          renderResults(props, equation, cursor, append, leftParens, rightParens)
        ];
      }

      let next = work[index + 1];
      return [
        renderChanges(
          props,
          step.state[0],
          step.changes[0],
          step.appends ? step.appends[0] : ''
        ),
        renderResults(props, next.state[0])
      ];
    });
  }

  return <div className="submissions-edit-question">
    <Tabular className="dark"
             cols={[
               {content: 'History', width: 325},
               {content: 'Results (select and edit here)', width: 325}
             ]}
             rows={rows} />
    <div className="next-and-previous">
      <div className="button" onClick={props.prevQuestion}>Previous</div>
      <div className="button-inverse" onClick={props.nextQuestion}>Next</div>
    </div>
  </div>;
}

function renderChanges(props, equation, changes, append = '', leftParens = false,
                       rightParens = false): React.Element {
  let symbol = stmt.getStmtSymbol(equation) || '=';
  return <div className="submissions-edit-changes unselectable">
    {
      (() => {
        function renderEquationChar(chr, index) {
          let style = {};
          // TODO(gaye): Need to handle non-equality statements...
          let changeIndex = index >= equation.indexOf(symbol) ?
            index - append.length :
            index;
          let change = changes[changeIndex];
          switch (change) {
            case 'highlight':
              style.backgroundColor = 'rgba(57, 150, 240, 0.5)';
              break;
            case 'strikethrough':
              style.backgroundColor = 'rgba(226, 37, 23, 0.5)';
              break;
            case 'none':
              break;
            default:
              throw new Error(`Unexpected change token ${change}`);
          }

          return <div key={index} style={style}>
            <span style={{color: 'black'}}>{chr}</span>
          </div>;
        }

        function renderAppendChar(chr, index) {
          return <div key={index}
                      style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
            <span style={{color: 'black'}}>{chr}</span>
          </div>;
        }

        let [left, right] = equation.split(symbol);
        if (!right) {
          // TODO(gaye): This is still ignoring statements other
          //     than equality.
          // This is just an expression (e.g. arithmetic problem)
          return mapChar(left, renderEquationChar);
        }

        if (equation.length > changes.length) {
          // Ahhh? This is a workaround for an issue
          // I don't totally understand. Sometimes we get changes
          // for an equation with both sides applied and the equation
          // has both sides applied. We should make sure to remove
          // the append from the equation in this case.
          left = left.slice(0, left.length - append.length);
          right = right.slice(0, right.length - append.length);
        }

        return [
            leftParens &&
            <div key="leftp0"
                 style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
              <span style={{color: 'black'}}>(</span>
            </div>
          ].concat(
            mapChar(left, renderEquationChar)
          )
          .concat(
            leftParens &&
            <div key="leftp1"
                 style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
              <span style={{color: 'black'}}>)</span>
            </div>
          )
          .concat(
            mapChar(append, (chr, index) => {
              return renderAppendChar(chr, index + left.length);
            })
          )
          .concat(
            [renderEquationChar(symbol, left.length + append.length)]
          )
          .concat(
            rightParens &&
            <div key="rightp0"
                 style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
              <span style={{color: 'black'}}>(</span>
            </div>
          )
          .concat(
            mapChar(right, (chr, index) => {
              return renderEquationChar(
                chr,
                index + left.length + append.length + 1
              );
            })
          )
          .concat(
            rightParens &&
            <div key="rightp1"
                 style={{backgroundColor: 'rgba(176, 235, 63, 0.5)'}}>
              <span style={{color: 'black'}}>)</span>
            </div>
          )
          .concat(
            mapChar(append, (chr, index) => {
              return renderAppendChar(
                chr,
                index + left.length + append.length + 1 + right.length
              );
            })
          );
      })()
    }
  </div>;
}

function renderResults(props, equation, cursor, append = '', leftParens = false,
                       rightParens = false): React.Element {
  // The way we've patched rendering for https://github.com/gaye/ml/issues/71 here is pretty cute
  // and confusing. This will get cleaned up but in the meantime beware!
  if (typeof cursor !== 'number') {
    return <KaTeXContainer ascii={equation} />;
  }

  let {highlight, drag, isCursorVisible} = props;
  let {left, right} = stmt.getLeftAndRight(equation);
  highlight = editor.applyDragToHighlight(highlight, cursor, drag);

  function renderChar(index) {
    let style = {};
    let chr;
    if (index < left.length ||
        index >= left.length + append.length &&
        index < equation.length + append.length) {
      // equation proper
      if (highlight && highlight[index]) {
        style.backgroundColor = 'rgba(57, 150, 240, 0.5)';
      }

      chr = index < left.length ?
        equation.charAt(index) :
        equation.charAt(index - append.length);
    } else {
      // append
      chr = index < left.length + append.length ?
        append.charAt(index - left.length) :
        append.charAt(index - equation.length - append.length);
    }

    let result = <div key={index}
                      className="submissions-edit-character unselectable"
                      style={style}>
      {chr}
    </div>;

    if (index === left.length) {
      return [
        leftParens &&
        <div key="leftp1" className="submissions-edit-character unselectable">)</div>,
        result
      ];
    }

    if (index === left.length + append.length) {
      return [
        result,
        rightParens &&
        <div key="rightp0" className="submissions-edit-character unselectable">(</div>
      ];
    }

    if (right && index === left.length + append.length + 1 + right.length) {
      return [
        rightParens &&
        <div key="rightp1" className="submissions-edit-character unselectable">)</div>,
        result
      ];
    }

    return result;
  }

  if (!right) {
    return <div key={stringify({equation, cursor})}
                className="submissions-edit-active"
                onMouseDown={props.repositionCursor}
                onMouseMove={props.stageCursorHighlight}
                onMouseUp={props.commitCursorHighlight}>
      {times(cursor, renderChar)}
      {isCursorVisible && <div className="submissions-edit-cursor unselectable"></div>}
      {times(equation.length - cursor + 1, i => renderChar(cursor + i))}
    </div>;
  }

  return <div key={stringify({equation, cursor})}
              className="submissions-edit-active"
              onMouseDown={props.repositionCursor}
              onMouseMove={props.stageCursorHighlight}
              onMouseUp={props.commitCursorHighlight}>
    {
      leftParens &&
      <div key="leftp0" className="submissions-edit-character unselectable">(</div>
    }
    {times(cursor, renderChar)}
    {isCursorVisible && <div className="submissions-edit-cursor unselectable"></div>}
    {times(equation.length + 2 * append.length - cursor + 1, i => renderChar(cursor + i))}
  </div>;
}

module.exports = EquationEditor;
