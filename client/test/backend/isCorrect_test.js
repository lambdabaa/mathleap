let isCorrect = require('../../src/backend/isCorrect');

suite('isCorrect', () => {
  test('#isCorrect expression', () => {
    isCorrect(
      {solution: 13},
      '13'
    )
    .should
    .equal(true);
  });

  test('#isCorrect equation', () => {
    isCorrect(
      {solution: 13},
      '13=x'
    )
    .should
    .equal(true);
  });

  test('#isCorrect false', () => {
    let correct = isCorrect(
      {solution: 13},
      'y=10'
    )
    .should
    .equal(false);
  });

  test('#isCorrect point-slope to slope-intercept', () => {
    let correct = isCorrect(
      {solution: 'y=3x-8'},
      'y=3x-8'
    );

    correct.should.equal(true);
  });

  test('#isCorrect 2 variable equation', () => {
    let correct = isCorrect(
      {solution: 'q=3-p'},
      'q=-p+3'
    );

    correct.should.equal(true);
  });

  test('#isCorrect polynomial grouping', () => {
    isCorrect(
      {solution: '3x+y-6'},
      'y-6+3x'
    )
    .should
    .equal(true);
  });

  test('#isCorrect difference of squares', () => {
    let correct = isCorrect(
      {solution: '(2x-3)(2x+3)'},
      '(2x+3)*(2x-3)'
    );

    correct.should.equal(true);
  });
});
