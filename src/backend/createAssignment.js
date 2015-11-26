let debug = console.log.bind(console, '[service/createAssignment]');
let flatten = require('lodash/array/flatten');
let groupBy = require('lodash/collection/groupBy');
let mapValues = require('lodash/object/mapValues');
let random = require('./random');
let range = require('lodash/utility/range');
let sample = require('lodash/collection/sample');

/**
 * @param {Array} composition spec for assignment.
 */
function createAssignment(composition) {
  debug('composition', JSON.stringify(composition));
  let typeToQuestions = mapValues(
    mapValues(
      groupBy(composition, section => section.type.name),
      sections => sections.reduce((total, section) => total + section.count, 0)
    ),
    createQuestions
  );

  debug('type to questions', JSON.stringify(typeToQuestions));
  let result = flatten(
    composition.map(section => {
      let type = section.type.name;
      let count = section.count;
      let questions = typeToQuestions[type];
      if (questions.length === count) {
        return questions;
      }

      // For whatever reason, the teacher decided to have multiple sections with
      // the same variety of question.
      return questions.splice(0, count);
    })
  );

  debug('assignment', JSON.stringify(result));
  return result;
}

function createQuestions(count, type) {
  return createQuestion[type](count);
}

let createQuestion = {};
createAssignment.createQuestion = createQuestion;

createQuestion['Simple addition'] = count => {
  let solutions = random.integerList(count);
  return solutions.map(solution => {
    let a = random.integer();
    return {question: `${a}+${solution - a}`, solution};
  });
};

createQuestion['Simple subtraction'] = count => {
  let solutions = random.integerList(count);
  return solutions.map(solution => {
    let a = random.integer();
    return {question: `${a}-${a - solution}`, solution};
  });
};

createQuestion['Simple multiplication'] = count => {
  let solutions = random.compositeList(count);
  return solutions.map(solution => {
    let a = random.factor(solution);
    return {question: `${a}*${solution / a}`, solution};
  });
};

createQuestion['Simple division'] = count => {
  let operands = random.compositeList(count);
  return operands.map(operand => {
    let solution = random.factor(operand);
    return {question: `${operand}/${operand / solution}`, solution};
  });
};

createQuestion['Simple exponentiation'] = count => {
  let small = range(-10, 10);
  let tiny = range(0, 4);
  return range(0, count).map(() => {
    let base = sample(small);
    let exp = sample(tiny);
    return {question: `${base}^${exp}`, solution: Math.pow(base, exp)};
  });
};

createQuestion['Solving equations of the form Ax = B'] = count => {
  let solutions = random.integerList(count);
  return solutions.map(solution => {
    let a = random.integer();
    let b = a * solution;
    let x = random.letter();
    return {question: `${a}${x}=${b}`, solution};
  });
};

createQuestion['Solving equations of the form x/A = B'] = count => {
  let solutions = random.compositeList(count);
  return solutions.map(solution => {
    let a = random.factor(solution);
    let b = solution / a;
    let x = random.letter();
    return {question: `${x}/${a}=${b}`, solution};
  });
};

createQuestion['Solving equations in one step with addition'] = count => {
  let solutions = random.integerList(count);
  return solutions.map(solution => {
    let a = random.integer();
    let b = solution + a;
    let x = random.letter();
    return {question: `${x}${a > 0 ? '+' : '-'}${Math.abs(a)}=${b}`, solution};
  });
};

createQuestion['Solving equations in two steps'] = count => {
  let solutions = random.integerList(count);
  return solutions.map(solution => {
    let a = random.integer();
    let b = random.integer();
    let c = a * solution + b;
    let x = random.letter();
    let question = b > 0 ?
      `${a}${x}+${b}=${c}` :
      `${a}${x}-${Math.abs(b)}=${c}`;
    return {question, solution};
  });
};

createQuestion['Equations with variables on both sides'] = count => {
  let solutions = random.integerList(count);
  return solutions.map(solution => {
    let a = random.integer();
    let b = random.integer();
    let c = random.integer();
    let d = a * solution + b - c * solution;
    let x = random.letter();
    let left = b > 0 ?
      `${a}${x}+${b}` :
      `${a}${x}-${Math.abs(b)}`;
    let right = d > 0 ?
      `${c}${x}+${d}` :
      `${c}${x}-${Math.abs(d)}`;
    return {question: `${left}=${right}`, solution};
  });
};

createQuestion['Simple distribution'] = count => {
  let solutions = random.integerList(count);
  return solutions.map(solution => {
    let a = random.integer();
    let b = random.integer();
    let c = a * (solution + b);
    let x = random.letter();
    let question = b > 0 ?
      `${a}(${x}+${b})=${c}` :
      `${a}(${x}-${Math.abs(b)})=${c}`;
    return {question, solution};
  });
};

createQuestion['Clever distribution'] = count => {
  let solutions = random.superCompositeList(count);
  return solutions.map(solution => {
    let c = random.compositeFactor(solution);
    let a = random.factor(c);
    let b = random.integer();
    let d = solution / a + b - solution / c;
    let x = random.letter();
    let left = b > 0 ?
      `${x}/${a}+${b}` :
      `${x}/${a}-${Math.abs(b)}`;
    let right = d > 0 ?
      `${x}/${c}+${d}` :
      `${x}/${c}-${Math.abs(d)}`;
    return {question: `${left}=${right}`, solution};
  });
};

module.exports = createAssignment;
