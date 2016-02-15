let editor = require('../../../../client/frontend/helpers/editor');

suite('helpers/editor', () => {
  test('#getInstruction specified', () => {
    editor.getInstruction({
      questions: [
        {},
        {
          question: 'x=5',
          instruction: 'Go to dagobah'
        },
        {}
      ]
    }, 1)
    .should
    .equal('Go to dagobah');
  });

  test('#getInstruction inequality', () => {
    editor.getInstruction({
      questions: [
        {question: 'x>5'}
      ]
    }, 0)
    .should
    .equal('Solve the inequality.');
  });

  test('#getInstruction equation', () => {
    editor.getInstruction({
      questions: [
        {question: 'x=5'}
      ]
    }, 0)
    .should
    .equal('Solve the equation.');
  });

  test('#getInstruction expression', () => {
    editor.getInstruction({
      questions: [
        {question: 'x'}
      ]
    }, 0)
    .should
    .equal('Simplify the expression.');
  });

  test('#moveCursorLeft', () => {
    editor.moveCursorLeft(4, 'x+11').should.equal(1);
  });

  test('#moveCursorLeft far left', () => {
    editor.moveCursorLeft(1, 'x+11').should.equal(0);
  });

  test('#moveCursorRight', () => {
    editor.moveCursorRight(0, '2x=5').should.equal(2);
  });

  test('#moveCursorRight far right', () => {
    editor.moveCursorRight(2, 'x+11').should.equal(4);
  });

  test.skip('#applyFirstChar', () => {
    // TODO: Write test for this once we have worker test support.
  });

  test.skip('#applyFirstChar inserts parens', () => {
    // TODO: Write test for this once we have worker test support.
  });

  test('#applyBothSidesChar', () => {
    // x+5-=0-
    editor.applyBothSidesChar(
      {key: '5', keyCode: 53},
      {
        append: '-',
        cursor: 7,
        equation: 'x+5=0',
        leftParens: false,
        rightParens: false
      }
    )
    .should
    .deep
    .equal({
      append: '-5',
      cursor: 9,
      leftParens: false,
      rightParens: false
    });
  });

  test('#applyBothSidesChar cursor on left', () => {
    // x+5-=0-
    editor.applyBothSidesChar(
      {key: '5', keyCode: 53},
      {
        append: '-',
        cursor: 4,
        equation: 'x+5=0',
        leftParens: false,
        rightParens: false
      }
    )
    .should
    .deep
    .equal({
      append: '-5',
      cursor: 5,
      leftParens: false,
      rightParens: false
    });
  });

  test('#selectionToDiffArgs single delete', () => {
    editor.selectionToDiffArgs({key: 'Backspace'}, 4, 4)
    .should
    .deep
    .equal([
      {type: 'cancel', range: [5, 5]},
      4
    ]);
  });

  test('#selectionToDiffArgs multiple delete', () => {
    editor.selectionToDiffArgs({key: 'Backspace'}, 4, 6)
    .should
    .deep
    .equal([
      {type: 'cancel', range: [4, 6]},
      4
    ]);
  });

  test('#selectionToDiffArgs replace', () => {
    editor.selectionToDiffArgs({key: '5', keyCode: 53}, 4, 5)
    .should
    .deep
    .equal([
      {type: 'replace', range: [4, 5], replacement: '5'},
      5
    ]);
  });

  test('#undoChar', () => {
    let previous = {foo: 0, bar: 1, undos: [], redos: []};
    let curr = {foo: 1, bar: 1, undos: [], redos: []};
    editor.undoChar([previous], [], curr)
    .should
    .deep
    .equal({
      undos: [],
      redos: [curr],
      foo: 0,
      bar: 1
    });
  });

  test('#redoChar', () => {
    let curr = {foo: 0, bar: 1, undos: [], redos: []};
    let next = {foo: 1, bar: 1, undos: [], redos: []};
    editor.redoChar([], [next], curr)
    .should
    .deep
    .equal({
      undos: [curr],
      redos: [],
      foo: 1,
      bar: 1
    });
  });

  test('#getHighlights', () => {
    editor.getHighlights([true, false, false, true, true, true, false, true])
    .should
    .deep
    .equal([
      {start: 0, end: 0},
      {start: 3, end: 5},
      {start: 7, end: 7}
    ]);
  });

  test('#getHighlights one highlight', () => {
    editor.getHighlights([false, true, true])
    .should
    .deep
    .equal([
      {start: 1, end: 2}
    ]);
  });

  test.skip('#eventToCursorPosition', () => {
    // TODO
  });

  test('#applyDragToHighlight drag to left', () => {
    editor.applyDragToHighlight(
      [false, false, false, false],
      3,
      0
    )
    .should
    .deep
    .equal([true, true, true, false]);
  });

  test('#applyDragToHighlight drag to right', () => {
    editor.applyDragToHighlight(
      [false, false, false, false],
      1,
      4
    )
    .should
    .deep
    .equal([false, true, true, true]);
  });

  test('#applyDragToHighlight no movement', () => {
    editor.applyDragToHighlight(
      [true, false, true, false],
      2,
      2
    )
    .should
    .deep
    .equal([true, false, false, false]);
  });
});
