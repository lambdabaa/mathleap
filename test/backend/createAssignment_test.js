let {createQuestion} = require('../../src/backend/createAssignment');

suite('service/createAssignment', function() {
  test('Ax=B', function() {
    let questions = createQuestion['Solving equations of the form Ax = B'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^(-?[1-9][0-9]*)[a-z]=(-?[1-9][0-9]*)$/);
      let b = parseInt(RegExp.$2, 10);
      let a = parseInt(RegExp.$1, 10);
      let remainder = b % a;
      remainder.should.equal(0);
      solution.should.equal(b / a);
    });
  });

  test('x/A=B', function() {
    let questions = createQuestion['Solving equations of the form x/A = B'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^[a-z]\/(-?[1-9][0-9]*)=(-?[1-9][0-9]*)$/);
      let b = parseInt(RegExp.$2, 10);
      let a = parseInt(RegExp.$1, 10);
      solution.should.equal(a * b);
    });
  });

  test('Solving equations in one step with addition', function() {
    let questions = createQuestion['Solving equations in one step with addition'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question} = aQuestion;
      question.should.match(/^[a-z][\+,\-](-?[0-9]+)=(-?[0-9]+)$/);
    });
  });
});
