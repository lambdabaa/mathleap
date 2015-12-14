let {createQuestion} = require('../../src/backend/createAssignment');
let mathjs = require('mathjs');

suite('service/createAssignment', function() {
  test('Simple addition', () => {
    let questions = createQuestion['Simple addition'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^(-?\d+)\+(-?\d+)$/);
      let a = parseInt(RegExp.$1, 10);
      let b = parseInt(RegExp.$2, 10);
      let sum = a + b;
      sum.should.equal(solution);
    });
  });

  test('Simple subtraction', () => {
    let questions = createQuestion['Simple subtraction'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^(-?\d+)\-(-?\d+)$/);
      let a = parseInt(RegExp.$1, 10);
      let b = parseInt(RegExp.$2, 10);
      let diff = a - b;
      diff.should.equal(solution);
    });
  });

  test('Simple multiplication', () => {
    let questions = createQuestion['Simple multiplication'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^(-?\d+)\*(-?\d+)$/);
      let a = parseInt(RegExp.$1, 10);
      let b = parseInt(RegExp.$2, 10);
      let product = a * b;
      product.should.equal(solution);
    });
  });

  test('Simple division', () => {
    let questions = createQuestion['Simple division'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^(-?\d+)\/(-?\d+)$/);
      let a = parseInt(RegExp.$1, 10);
      let b = parseInt(RegExp.$2, 10);
      let quotient = a / b;
      quotient.should.equal(solution);
    });
  });

  test('Simple exponentiation', () => {
    let questions = createQuestion['Simple exponentiation'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^(-?\d+)\^(-?\d+)$/);
      let a = parseInt(RegExp.$1, 10);
      let b = parseInt(RegExp.$2, 10);
      Math.abs(a).should.be.lte(10);
      b.should.be.lte(4);
      let result = Math.pow(a, b);
      result.should.equal(solution);
    });
  });

  test('Arithmetic distribution', () => {
    let questions = createQuestion['Arithmetic distribution'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      let actual = +mathjs.eval(question);
      actual.should.equal(solution);
    });
  });

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
    let questions =
      createQuestion['Solving equations in one step with addition'](10);
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
    let questions =
      createQuestion['Equations with variables on both sides'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question} = aQuestion;
      question.should.match(
        /^(-?[1-9]\d*)[a-z][\+, \-](\d*)=(-?[1-9]\d*)[a-z][\+, \-](\d*)$/
      );
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
      question.should.match(
        /^[a-z]\/-?\d*[\+, \-]\d*=[a-z]\/-?\d*[\+, \-]\d*$/
      );
    });
  });
});
