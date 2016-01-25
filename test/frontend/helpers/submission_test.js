let submission = require('../../../src/frontend/helpers/submission');

suite('helpers/submission', () => {
  test.skip('#getHeaderText', () => {
    // TODO
  });

  test('#isCorrect expression', async () => {
    let correct = await submission.isCorrect(
      {solution: 13},
      '13'
    );

    correct.should.equal(true);
  });

  test('#isCorrect equation', async () => {
    let correct = await submission.isCorrect(
      {solution: 13},
      '13=x'
    );

    correct.should.equal(true);
  });

  test('#isCorrect false', async () => {
    let correct = await submission.isCorrect(
      {solution: 13},
      'y=10'
    );

    correct.should.equal(false);
  });

  test.skip('#isCorrect point-slope to slope-intercept', async () => {
    let correct = await submission.isCorrect(
      {solution: 'y=3x-8'},
      'y=3x-8'
    );

    correct.should.equal(true);
  });

  test.skip('#isCorrect 2 variable equation', async () => {
    let correct = await submission.isCorrect(
      {solution: 'q=3-p'},
      'q=-p+3'
    );

    correct.should.equal(true);
  });

  test.skip('#isCorrect polynomial grouping', async () => {
    let correct = await submission.isCorrect(
      {solution: '3x+y-6'},
      'y-6+3x'
    );

    correct.should.equal(true);
  });

  test.skip('#isCorrect difference of squares', async () => {
    let correct = await submission.isCorrect(
      {solution: '(2x-3)(2x+3)'},
      '(2x+3)*(2x-3)'
    );

    correct.should.equal(true);
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

  test.skip('#getSubmissionGrade', () => {
  });
});
