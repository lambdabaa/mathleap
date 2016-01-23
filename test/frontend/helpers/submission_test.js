let submission = require('../../../src/frontend/helpers/submission');

suite('helpers/submission', () => {
  test('#isCorrect expression', () => {
    submission.isCorrect(
      {solution: 13},
      '13'
    )
    .should
    .equal(true);
  });

  test('#isCorrect equation', () => {
    submission.isCorrect(
      {solution: 13},
      '13=x'
    )
    .should
    .equal(true);
  });

  test('#isCorrect false', () => {
    submission.isCorrect(
      {solution: 13},
      'y=10'
    )
    .should
    .equal(false);
  });

  test('#getErrorLine', () => {
    submission.getErrorLine({
      work: {
        '0': {error: false},
        '1': {error: false},
        '2': {error: true},
        '3': {}
      }
    })
    .should
    .equal(2);
  });
});
