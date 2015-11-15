let diff = require('../../src/backend/diff');

suite('backend/diff', () => {
  test('#applyDiff', () => {
    diff.applyDiff(
      [
        {pos: 9, chr: 57, highlight: 13},
        {pos: 3, chr: 8, highlight: 8}
      ],
      'x^2+-x+x+10-1=0'
    )
    .should
    .equal('x^2+9=0');
  });

  test('#applyDiff hard', () => {
    diff.applyDiff(
      [
        {pos: 3, chr: 8, highlight: 5},
        {pos: 3, chr: 120, highlight: null},
        {pos: 4, chr: 8, highlight: null}
      ],
      '3w=45'
    )
    .should
    .equal('3w=');
  });

  test('#getChanges easy', () => {
    diff.getChanges(
      [
        {pos: 9, chr: 57, highlight: 13},
        {pos: 3, chr: 8, highlight: 8}
      ],
      'x^2+-x+x+10-1=0'
    )
    .should
    .deep
    .equal([
      'none',
      'none',
      'none',
      'strikethrough',
      'strikethrough',
      'strikethrough',
      'strikethrough',
      'strikethrough',
      'none',
      'highlight',
      'highlight',
      'highlight',
      'highlight',
      'none',
      'none'
    ]);
  });

  test('#getChanges easy 2', () => {
    diff.getChanges(
      [
        {pos: 0, chr: 120, highlight: 2}
      ],
      '3w=45'
    )
    .should
    .deep
    .equal([
      'highlight',
      'highlight',
      'none',
      'none',
      'none'
    ]);
  });

  test('#getChanges easy 3', () => {
    diff.getChanges(
      [
        {pos: 0, chr: 8, highlight: 2},
        {pos: 0, chr: 120, highlight: null}
      ],
      '3w=45'
    )
    .should
    .deep
    .equal([
      'highlight',
      'highlight',
      'none',
      'none',
      'none'
    ]);
  });

  // x^2+2x-x=0
  //     ____           [backspace]
  // x^2+=0
  //    |               [x+x-x]
  // x^2+x+x-x=0
  //         _          [backspace]
  //        _           [backspace]
  //       _            [backspace]
  test('#getChanges hard', () => {
    diff.getChanges(
      [
        {pos: 4, chr: 8, highlight: 8},
        {pos: 4, chr: 88, highlight: null},
        {pos: 5, chr: 43, highlight: null},
        {pos: 6, chr: 88, highlight: null},
        {pos: 7, chr: 45, highlight: null},
        {pos: 8, chr: 88, highlight: null},
        {pos: 9, chr: 8, highlight: null},
        {pos: 8, chr: 8, highlight: null},
        {pos: 7, chr: 8, highlight: null}
      ],
      'x^2+2x-x=0'
    )
    .should
    .deep
    .equal([
      'none',
      'none',
      'none',
      'none',
      'highlight',
      'highlight',
      'highlight',
      'highlight',
      'none',
      'none'
    ]);
  });

  test('#getChanges hard 2', () => {
    diff.getChanges(
      [
        {pos: 3, chr: 8, highlight: 5},
        {pos: 3, chr: 50, highlight: null},
        {pos: 4, chr: 120, highlight: null},
        {pos: 3, chr: 8, highlight: 5}
      ],
      '3w=45'
    )
    .should
    .deep
    .equal([
      'none',
      'none',
      'none',
      'strikethrough',
      'strikethrough'
    ]);
  });

  test('#getChanges hard 3', () => {
    diff.getChanges(
      [
        {pos: 3, chr: 8, highlight: 5},
        {pos: 3, chr: 50, highlight: null},
        {pos: 4, chr: 120, highlight: null},
        {pos: 3, chr: 120, highlight: 5}
      ],
      '3w=45'
    )
    .should
    .deep
    .equal([
      'none',
      'none',
      'none',
      'highlight',
      'highlight'
    ]);
  });
});
