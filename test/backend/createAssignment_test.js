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

  test('Adding and subtracting fractions', () => {
    let questions = createQuestion['Adding and subtracting fractions'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      let [numerator, denominator] = solution.split('/');
      // This checks that the fraction is in simplest form.
      mathjs.gcd(numerator, denominator).should.equal(1);
      let actual = +mathjs.eval(question);
      actual.should.be.closeTo(
        eval(solution),
        0.00001,
        JSON.stringify({actual: question, expected: solution})
      );
    });
  });

  test('Multiplying fractions', () => {
    let questions = createQuestion['Multiplying fractions'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      let [numerator, denominator] = solution.split('/');
      mathjs.gcd(numerator, denominator).should.equal(1);
      let actual = +mathjs.eval(question);
      actual.should.be.closeTo(eval(solution), 0.00001);
    });
  });

  test('Dividing fractions', () => {
    let questions = createQuestion['Dividing fractions'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      let [numerator, denominator] = solution.split('/');
      mathjs.gcd(numerator, denominator).should.equal(1);
      let actual = +mathjs.eval(question);
      actual.should.be.closeTo(eval(solution), 0.00001);
    });
  });

  test('Ax=B', () => {
    let questions = createQuestion['Solving equations of the form Ax = B'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^(-?[1-9]\d*)[a-z]=(-?\d+)$/);
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
      question.should.match(/^[a-z]\/(-?[1-9]\d*)=(-?\d+)$/);
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
      question.should.match(/^[a-z][\+,\-](-?\d+)=(-?\d+)$/);
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
