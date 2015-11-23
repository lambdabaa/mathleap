let {createQuestion} = require('../../src/backend/createAssignment');

suite('service/createAssignment', function() {
  test('Ax=B', () => {
    let questions = createQuestion['Solving equations of the form Ax = B'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^(-?[1-9]\d*)[a-z]=(-?[1-9]\d*)$/);
      let b = parseInt(RegExp.$2, 10);
      let a = parseInt(RegExp.$1, 10);
      let remainder = b % a;
      remainder.should.equal(0);
      solution.should.equal(b / a);
    });
  });

  test('x/A=B', () => {
    let questions = createQuestion['Solving equations of the form x/A = B'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^[a-z]\/(-?[1-9]\d*)=(-?[1-9]\d*)$/);
      let a = parseInt(RegExp.$1, 10);
      let b = parseInt(RegExp.$2, 10);
      solution.should.equal(a * b);
    });
  });

  test('Solving equations in one step with addition', () => {
    let questions = createQuestion['Solving equations in one step with addition'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question} = aQuestion;
      question.should.match(/^[a-z][\+,\-](-?\d+)=(-?[0-9]+)$/);
    });
  });

  test('Solving equations in two steps', () => {
    let questions = createQuestion['Solving equations in two steps'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question} = aQuestion;
      question.should.match(/^(-?[1-9]\d*)[a-z][\+, \-](\d*)=(-?\d*)$/);
    });
  });

  test('Equations with variables on both sides', () => {
    let questions = createQuestion['Equations with variables on both sides'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question} = aQuestion;
      question.should.match(/^(-?[1-9]\d*)[a-z][\+, \-](\d*)=(-?[1-9]\d*)[a-z][\+, \-](\d*)$/);
    });
  });

  test('Simple distribution', () => {
    let questions = createQuestion['Simple distribution'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question} = aQuestion;
      question.should.match(/^(-?[1-9]\d*)\([a-z][\+, \-](\d*)\)=(-?\d*)$/);
    });
  });

  test('Clever distribution', () => {
    let questions = createQuestion['Clever distribution'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question} = aQuestion;
      question.should.match(/^[a-z]\/-?\d*[\+, \-]\d*=[a-z]\/-?\d*[\+, \-]\d*$/);
    });
  });
});
