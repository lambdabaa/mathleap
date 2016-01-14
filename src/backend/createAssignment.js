/**
 * @fileoverview Generate random sets of questions by question type(s).
 */

let debug = console.log.bind(console, '[createAssignment]');
let flatten = require('lodash/array/flatten');
let find = require('lodash/collection/find');
let groupBy = require('lodash/collection/groupBy');
let isInteger = require('./isInteger');
let mapValues = require('lodash/object/mapValues');
let random = require('./random');
let range = require('lodash/utility/range');
let round = require('./round');

/**
 * createQuestion functions get called with two arguments:
 * a count which is the number of questions to generate
 * and an options object with the following options:
 *
 *   (Array.<number>) exclude - don't generate solutions in this list.
 */
let createQuestion = {};
createAssignment.createQuestion = createQuestion;

createQuestion['Simple addition'] = function() {
  let solutions = random.integerList(...arguments);
  return solutions.map(solution => {
    let a = random.integer();
    return {question: `${a}+${solution - a}`, solution};
  });
};

createQuestion['Simple subtraction'] = function() {
  let solutions = random.integerList(...arguments);
  return solutions.map(solution => {
    let a = random.integer();
    return {question: `${a}-${a - solution}`, solution};
  });
};

createQuestion['Simple multiplication'] = function() {
  let solutions = random.compositeList(...arguments);
  return solutions.map(solution => {
    let a = random.factor(solution);
    return {question: `${a}*${solution / a}`, solution};
  });
};

createQuestion['Simple division'] = function() {
  let solutions = random.integerList(...arguments);
  return solutions.map(solution => {
    let denom = random.integer();
    let num = solution * denom;
    return {question: `${num}/${denom}`, solution};
  });
};

createQuestion['Simple exponentiation'] = function() {
  let solutions = random.powerList(...arguments);
  return solutions.map(solution => {
    let root = find(
      range(0, 4).reverse(),
      candidate => {
        let base = round(Math.pow(solution, 1 / candidate));
        return isInteger(base);
      }
    );

    let base = round(Math.pow(solution, 1 / root));
    return {question: `${base}^${root}`, solution};
  });
};

createQuestion['Adding and subtracting fractions'] = function() {
  let solutions = random.fractionList(...arguments);
  return solutions.map(solution => {
    let [a, b] = solution.split('/').map(num => parseInt(num));
    let operator = random.boolean() ? '+' : '-';
    let c = random.integer();
    let d = operator === '+' ? a - c : c - a;
    let negate1 = c >= 0 !== b > 0;
    let negate2 = d >= 0 !== b > 0;
    let absb = Math.abs(b);
    c = Math.abs(c);
    d = Math.abs(d);

    let left = `${negate1 ? '-' : ''}${c}/${absb}`;
    let right = `${negate2 ? '(-' : ''}${d}/${absb}${negate2 ? ')' : ''}`;
    return {question: `${left}${operator}${right}`, solution: `${a}/${b}`};
  });
};

createQuestion['Arithmetic distribution'] = function() {
  let solutions = random.compositeList(...arguments);
  return solutions.map(solution => {
    let a = random.factor(solution);
    let b = solution / a;
    let c = random.integerList(1, [b])[0];
    let d = Math.abs(b - c);
    return {question: `${a}(${c}${b > c ? '+' : '-'}${d})`, solution};
  });
};

createQuestion['Solving equations of the form Ax = B'] = function() {
  let solutions = random.integerList(...arguments);
  return solutions.map(solution => {
    let a = random.integer();
    let b = a * solution;
    let x = random.letter();
    return {question: `${a}${x}=${b}`, solution};
  });
};

createQuestion['Solving equations of the form x/A = B'] = function() {
  let solutions = random.compositeList(...arguments);
  return solutions.map(solution => {
    let a = random.factor(solution);
    let b = solution / a;
    let x = random.letter();
    return {question: `${x}/${a}=${b}`, solution};
  });
};

createQuestion['Solving equations in one step with addition'] = function() {
  let solutions = random.integerList(...arguments);
  return solutions.map(solution => {
    let a = random.integer();
    let b = solution + a;
    let x = random.letter();
    return {question: `${x}${a > 0 ? '+' : '-'}${Math.abs(a)}=${b}`, solution};
  });
};

createQuestion['Solving equations in two steps'] = function() {
  let solutions = random.integerList(...arguments);
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

createQuestion['Equations with variables on both sides'] = function() {
  let solutions = random.integerList(...arguments);
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

createQuestion['Simple distribution'] = function() {
  let solutions = random.integerList(...arguments);
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

createQuestion['Clever distribution'] = function() {
  let solutions = random.superCompositeList(...arguments);
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

/**
 * Options:
 *
 *   (Array) exclude list of solutions to avoid.
 */
function createQuestions(count, type, options = {}) {
  debug('createQuestions', JSON.stringify(arguments));
  return createQuestion[type](count, options.exclude || []);
}

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

module.exports = createAssignment;
module.exports.createQuestions = createQuestions;
