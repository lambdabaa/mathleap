let submission = require('../../../src/frontend/helpers/submission');

suite('helpers/submission', () => {
  test.skip('#getHeaderText', () => {
    // TODO
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
