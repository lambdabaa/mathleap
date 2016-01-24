/* @flow */
/**
 * @fileoverview Generate random sets of questions by question type(s).
 */

let debug = require('../common/debug')('createAssignment');
let flatten = require('lodash/array/flatten');
let find = require('lodash/collection/find');
let generate = require('./generate');
let groupBy = require('lodash/collection/groupBy');
let isInteger = require('./isInteger');
let mapValues = require('lodash/object/mapValues');
let normalizeFraction = require('./normalizeFraction');
let fraction = require('./fraction');
let range = require('lodash/utility/range');
let round = require('./round');

import type {
  AssignmentQuestion,
  AssignmentSection,
  Numeric
} from '../common/types';

/**
 * createQuestion functions get called with two arguments:
 * a count which is the number of questions to generate
 * and an exclude array (Array<number>)
 */
let createQuestion = {};
createAssignment.createQuestion = createQuestion;

createQuestion['Simple addition'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.integerList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.integer();
    return {question: `${a}+${solution - a}`, solution};
  });
};

createQuestion['Simple subtraction'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.integerList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.integer();
    return {question: `${a}-${a - solution}`, solution};
  });
};

createQuestion['Simple multiplication'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.compositeList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.factor(solution);
    return {question: `${a}*${solution / a}`, solution};
  });
};

createQuestion['Simple division'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.integerList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let denom = generate.integer([0]);
    let num = solution * denom;
    return {question: `${num}/${denom}`, solution};
  });
};

createQuestion['Simple exponentiation'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.powerList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
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

createQuestion['Adding and subtracting fractions'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.fractionList(...arguments);
  return solutions.map((solution: string): AssignmentQuestion => {
    let [a, b] = solution.split('/').map(num => parseInt(num));
    let operator = generate.boolean() ? '+' : '-';
    let c, d, question;
    if (operator === '+') {
      c = generate.absBoundedInteger(1, Math.abs(a) + 1);
      d = a - c;
      question = `${normalizeFraction(c, b)}+${normalizeFraction(d, b)}`;
    } else {
      c = generate.absBoundedInteger(1, b);
      if (c > a) {
        d = c - a;
        question = `${normalizeFraction(c, b)}-${normalizeFraction(d, b)}`;
      } else {
        d = c + a;
        question = `${normalizeFraction(d, b)}-${normalizeFraction(c, b)}`;
      }
    }

    return {question, solution: `${a}/${b}`};
  });
};

createQuestion['Multiplying fractions'] = createFractionMultiplications.bind(null, false);

createQuestion['Dividing fractions'] = createFractionMultiplications.bind(null, true);

createQuestion['Arithmetic distribution'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.compositeList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.factor(solution, [0]);
    let b = solution / a;
    let c = generate.integerList(1, [b])[0];
    let d = Math.abs(b - c);
    return {question: `${a}(${c}${b > c ? '+' : '-'}${d})`, solution};
  });
};

createQuestion['Solving equations of the form Ax = B'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.integerList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.integer([0]);
    let b = a * solution;
    let x = generate.letter();
    return {question: `${a}${x}=${b}`, solution};
  });
};

createQuestion['Solving equations of the form x/A = B'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.compositeList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.factor(solution, [0]);
    let b = solution / a;
    let x = generate.letter();
    return {question: `${x}/${a}=${b}`, solution};
  });
};

createQuestion['Solving equations in one step with addition'] =
function(): Array<AssignmentQuestion> {
  let solutions = generate.integerList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.integer([0]);
    let b = solution + a;
    let x = generate.letter();
    return {question: `${x}${a > 0 ? '+' : '-'}${Math.abs(a)}=${b}`, solution};
  });
};

createQuestion['Solving equations in two steps'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.integerList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.integer([0]);
    let b = generate.integer([0]);
    let c = a * solution + b;
    let x = generate.letter();
    let question = b > 0 ?
      `${a}${x}+${b}=${c}` :
      `${a}${x}-${Math.abs(b)}=${c}`;
    return {question, solution};
  });
};

createQuestion['Equations with variables on both sides'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.integerList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.integer([0]);
    let b = generate.integer([0]);
    let c = generate.integer([0]);
    let d = a * solution + b - c * solution;
    let x = generate.letter();
    let left = b > 0 ?
      `${a}${x}+${b}` :
      `${a}${x}-${Math.abs(b)}`;
    let right = d > 0 ?
      `${c}${x}+${d}` :
      `${c}${x}-${Math.abs(d)}`;
    return {question: `${left}=${right}`, solution};
  });
};

createQuestion['Simple distribution'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.integerList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.integer([0]);
    let b = generate.integer([0]);
    let c = a * (solution + b);
    let x = generate.letter();
    let question = b > 0 ?
      `${a}(${x}+${b})=${c}` :
      `${a}(${x}-${Math.abs(b)})=${c}`;
    return {question, solution};
  });
};

createQuestion['Clever distribution'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.superCompositeList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let c = generate.compositeFactor(solution);
    let a = generate.factor(c, [0]);
    let b = generate.integer([0]);
    let d = solution / a + b - solution / c;
    let x = generate.letter();
    let left = b > 0 ?
      `${x}/${a}+${b}` :
      `${x}/${a}-${Math.abs(b)}`;
    let right = d > 0 ?
      `${x}/${c}+${d}` :
      `${x}/${c}-${Math.abs(d)}`;
    return {question: `${left}=${right}`, solution};
  });
};

function createFractionMultiplications(invert: boolean, count: number,
                                       exclude: Array<Numeric> = []): Array<AssignmentQuestion> {
  let solutions = generate.compositeFractionList(count, exclude);
  return solutions.map((solution: string): AssignmentQuestion => {
    let [aNumerator, aDenominator] = solution.split('/').map(num => parseInt(num));
    let [bNumerator, bDenominator] = generate
      .boundedFraction({
        numerator: {start: Math.abs(aNumerator), end: Math.abs(aDenominator)},
        denominator: {start: Math.abs(aNumerator), end: Math.abs(aDenominator)}
      })
      .split('/')
      .map(num => parseInt(num));

    let a = normalizeFraction(aNumerator, aDenominator);
    let b = normalizeFraction(bNumerator, bDenominator);

    let fn = (invert ? fraction.multiply : fraction.divide).bind(fraction);
    let {s, n, d} = fn(fraction.fraction(a), fraction.fraction(b));
    let operator = invert ? '/' : '*';
    return {question: `(${s === -1 ? '-' : ''}${n}/${d})${operator}(${b})`, solution: `${a}`};
  });
}

/**
 * Options:
 *
 *   (Array) exclude list of solutions to avoid.
 */
function createQuestions(count: number, type: string,
                         options: Object = {}): Array<AssignmentQuestion> {
  debug('createQuestions', JSON.stringify(arguments));
  return createQuestion[type](count, options.exclude || []);
}

/**
 * @param {Array} composition spec for assignment.
 */
function createAssignment(composition: Array<AssignmentSection>): Array<AssignmentQuestion> {
  debug('composition', JSON.stringify(composition));
  let typeToQuestions = mapValues(
    mapValues(
      groupBy(
        composition,
        function(section: AssignmentSection): string {
          return section.type.name;
        }
      ),
      function(sections: Array<AssignmentSection>): number {
        return sections.reduce(function(total: number, section: AssignmentSection): number {
          return total + section.count;
        }, 0);
      }
    ),
    createQuestions
  );

  debug('type to questions', JSON.stringify(typeToQuestions));
  let result = flatten(
    composition.map(function(section: AssignmentSection): Array<AssignmentQuestion> {
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
