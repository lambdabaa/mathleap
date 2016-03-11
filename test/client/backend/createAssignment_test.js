let {createQuestion} = require('../../../client/backend/createAssignment');
let formatDecimal = require('../../../client/backend/formatDecimal');
let mathjs = require('mathjs');

mathjs.config({number: 'fraction'});

suite('service/createAssignment', function() {
  test('Simple addition', () => {
    let questions = createQuestion['Simple addition'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^(-?\d+)\+\(?(-?\d+)\)?$/);
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
      question.should.match(/^(-?\d+)\-\(?(-?\d+)\)?$/);
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

  test('Decimal addition', () => {
    let questions = createQuestion['Decimal addition'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^(\d+\.?\d*)\+(\d+\.?\d*)$/);
      question.length.should.be.lt(12);
      let a = parseFloat(RegExp.$1);
      let b = parseFloat(RegExp.$2);
      let sum = formatDecimal(a + b);
      sum.should.equal(solution);
    });
  });

  test('Decimal subtraction', () => {
    let questions = createQuestion['Decimal subtraction'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^(\d+\.?\d*)\-(\d+\.?\d*)$/);
      question.length.should.be.lt(12);
      let a = parseFloat(RegExp.$1);
      let b = parseFloat(RegExp.$2);
      let sum = formatDecimal(a - b);
      sum.should.equal(solution);
    });
  });

  test('Decimal multiplication', () => {
    let questions = createQuestion['Decimal multiplication'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^(\d+\.\d+)\*(\d+\.?\d*)$/);
      question.length.should.be.lt(13);
      let a = parseFloat(RegExp.$1);
      let b = parseFloat(RegExp.$2);
      let product = formatDecimal(a * b);
      product.should.equal(solution);
    });
  });

  test('Decimal division', () => {
    let questions = createQuestion['Decimal division'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, solution} = aQuestion;
      question.should.match(/^(\d+\.\d+)\/(\d\.\d+)$/);
      question.length.should.be.lt(13);
      let a = parseFloat(RegExp.$1);
      let b = parseFloat(RegExp.$2);
      let quotient = formatDecimal(a / b, 4);
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

      // Check solution
      mathjs.gcd(numerator, denominator).should.equal(1);

      // Check operands
      question.split('*').forEach(operand => {
        let [numerator, denominator] = operand
          .split('/')
          .map(value => {
            return parseInt(
              value
                .replace('(', '')
                .replace(')', '')
            );
          });
        numerator.should.not.equal(denominator, `Operand ${operand} reduces to 1`);
        Math.abs(numerator).should.be.lte(25, `Operand ${operand} too hard`);
        Math.abs(denominator).should.be.lte(25, `Operand ${operand} too hard`);
      });

      // Check equality
      let actual = +mathjs.eval(question);
      actual.should.be.closeTo(
        eval(solution),
        0.00001,
        JSON.stringify({actual: question, expected: solution})
      );
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
      actual.should.be.closeTo(
        eval(solution),
        0.00001,
        JSON.stringify({actual: question, expected: solution})
      );
    });
  });

  test('Expressions with one variable', () => {
    let questions = createQuestion['Evaluating expressions with one variable'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, instruction, solution} = aQuestion;
      instruction.should.match(/^Evaluate when ([a-z]) is (-?\d+)\.$/);
      eval(question.replace(RegExp.$1, `*${RegExp.$2}`)).should.equal(
        solution,
        JSON.stringify(aQuestion)
      );
    });
  });

  test('Expressions with two variables', () => {
    let questions = createQuestion['Evaluating expressions with two variables'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, instruction, solution} = aQuestion;
      instruction.should.match(/^Evaluate when ([a-z]) is (-?\d+) and ([a-z]) is (-?\d+)\.$/);
      RegExp.$1.should.not.equal(RegExp.$2);  // 2 variables
      eval(
        question
          .replace(RegExp.$1, `*${RegExp.$2}`)
          .replace(RegExp.$3, `*${RegExp.$4}`)
      )
      .should
      .equal(
        solution,
        JSON.stringify(aQuestion)
      );
    });
  });

  test('Evaluating fractional expressions with two variables', () => {
    let questions = createQuestion['Evaluating fractional expressions with two variables'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {question, instruction, solution} = aQuestion;
      question.should.match(/^[a-z]\/[a-z]$/);
      instruction.should.match(/^Evaluate when ([a-z]) is (-?\d+) and ([a-z]) is (-?\d+)\.$/);
      RegExp.$1.should.not.equal(RegExp.$2);  // 2 variables
      eval(
        question
          .replace(RegExp.$1, RegExp.$2)
          .replace(RegExp.$3, RegExp.$4)
      )
      .should
      .equal(
        solution,
        JSON.stringify(aQuestion)
      );
    });
  });

  test('Ax=B', () => {
    let questions = createQuestion['Solving equations of the form Ax = B'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {instruction, question, solution} = aQuestion;
      let variable = instruction.charAt(instruction.length-2);
      let instructionForm = new RegExp(`^Solve for ${variable}\.$`);
      let equationForm = new RegExp(`^(-?[1-9]\\d*)${variable}=(-?\\d+)$`);
      instruction.should.match(instructionForm);
      question.should.match(equationForm);
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
      let {instruction, question, solution} = aQuestion;
      let variable = instruction.charAt(instruction.length-2);
      let instructionForm = new RegExp(`^Solve for ${variable}\.$`);
      let equationForm = new RegExp(`^${variable}\\/(-?[1-9]\\d*)=(-?\\d+)$`);
      instruction.should.match(instructionForm);
      question.should.match(equationForm);
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
      let {instruction, question} = aQuestion;
      let variable = instruction.charAt(instruction.length-2);
      let instructionForm = new RegExp(`^Solve for ${variable}\.$`);
      let equationForm = new RegExp(`^${variable}[\\+,\\-](-?\\d+)=(-?\\d+)$`);
      question.should.match(equationForm);
      instruction.should.match(instructionForm);
    });
  });

  test('Solving equations in two steps', () => {
    let questions = createQuestion['Solving equations in two steps'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {instruction, question} = aQuestion;
      let variable = instruction.charAt(instruction.length-2);
      let instructionForm = new RegExp(`^Solve for ${variable}\.$`);
      let equationForm = new RegExp(`^(-?[1-9]\\d*)${variable}[\\+, \\-](\\d*)=(-?\\d*)$`);
      question.should.match(equationForm);
      instruction.should.match(instructionForm);
    });
  });

  test('Equations with variables on both sides', () => {
    let questions =
      createQuestion['Equations with variables on both sides'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {instruction, question} = aQuestion;
      let variable = instruction.charAt(instruction.length-2);
      let instructionForm = new RegExp(`^Solve for ${variable}\.$`);
      let equationForm = new RegExp(
        `^(-?[1-9]\\d*)${variable}[\\+, \\-](\\d*)=(-?[1-9]\\d*)${variable}[\\+, \\-](\\d*)$`
      );
      question.should.match(equationForm);
      instruction.should.match(instructionForm);
    });
  });

  test('Simple distribution', () => {
    let questions = createQuestion['Simple distribution'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {instruction, question} = aQuestion;
      let variable = instruction.charAt(instruction.length-2);
      let instructionForm = new RegExp(`^Solve for ${variable}\.$`);
      let equationForm = new RegExp(`^(-?[1-9]\\d*)\\(${variable}[\\+, \\-](\\d*)\\)=(-?\\d*)$`);
      question.should.match(equationForm);
      instruction.should.match(instructionForm);
    });
  });

  test('Clever distribution', () => {
    let questions = createQuestion['Clever distribution'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {instruction, question} = aQuestion;
      let variable = instruction.charAt(instruction.length-2);
      let instructionForm = new RegExp(`^Solve for ${variable}\.$`);
      let equationForm = new RegExp(
        `^${variable}\\/-?\\d*[\\+, \\-]\\d*=${variable}\\/-?\\d*[\\+, \\-]\\d*$`
      );
      question.should.match(equationForm);
      instruction.should.match(instructionForm);
    });
  });

  test('One step inequalities', () => {
    let questions = createQuestion['One step inequalities'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {instruction, question, solution} = aQuestion;
      if (question.indexOf('/') !== -1) {
        question.should.match(/^([a-z])\/(-?\d+)([>,<])(-?\d+)$/);
        let x = RegExp.$1;
        let a = parseInt(RegExp.$2);
        let stmt = RegExp.$3;
        let b = RegExp.$4;
        instruction.should.equal(`Solve the inequality for ${x}.`);

        if (a < 0) {
          stmt = stmt === '>' ? '<' : '>';
        }

        solution.should.equal(`${x}${stmt}${b * a}`);
        return;
      }

      question.should.match(/^(-?\d+)([a-z])([>,<])(-?\d+)$/);
      let a = RegExp.$1;
      let x = RegExp.$2;
      let stmt = RegExp.$3;
      let b = RegExp.$4;
      instruction.should.equal(`Solve the inequality for ${x}.`);
      if (a < 0) {
        stmt = stmt === '>' ? '<' : '>';
      }

      solution.should.equal(`${x}${stmt}${b / a}`);
    });
  });

  test('Two step inequalities', () => {
    let questions = createQuestion['Two step inequalities'](10);
    questions.should.have.length(10);
    questions.forEach(aQuestion => {
      let {instruction, question, solution} = aQuestion;
      if (question.indexOf('/') !== -1) {
        question.should.match(/^([a-z])\/(-?\d+)([+,-]\d+)([>,<])(-?\d+)$/);
        let x = RegExp.$1;
        let a = parseInt(RegExp.$2);
        let b = parseInt(RegExp.$3);
        let stmt = RegExp.$4;
        let c = parseInt(RegExp.$5);
        instruction.should.equal(`Solve the inequality for ${x}.`);

        if (a < 0) {
          stmt = stmt === '>' ? '<' : '>';
        }

        solution.should.equal(`${x}${stmt}${(c - b) * a}`);
        return;
      }

      question.should.match(/^(-?\d+)([a-z])([+,-]\d+)([>,<])(-?\d+)$/);
      let a = parseInt(RegExp.$1);
      let x = RegExp.$2;
      let b = parseInt(RegExp.$3);
      let stmt = RegExp.$4;
      let c = parseInt(RegExp.$5);
      instruction.should.equal(`Solve the inequality for ${x}.`);
      if (a < 0) {
        stmt = stmt === '>' ? '<' : '>';
      }

      solution.should.equal(`${x}${stmt}${(c - b) / a}`);
    });
  });
});
