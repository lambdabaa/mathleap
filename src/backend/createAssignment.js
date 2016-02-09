/* @flow */
/**
 * @fileoverview Generate random sets of questions by question type(s).
 */

let debug = require('../common/debug')('createAssignment');
let flatten = require('lodash/array/flatten');
let find = require('lodash/collection/find');
let fraction = require('./fraction');
let generate = require('./generate');
let groupBy = require('lodash/collection/groupBy');
let isInteger = require('./isInteger');
let mapValues = require('lodash/object/mapValues');
let min = require('lodash/math/min');
let normalizeFraction = require('./normalizeFraction');
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
    let b = solution - a;
    if (b < 0) {
      b = `(${b})`;
    }

    return {question: `${a}+${b}`, solution};
  });
};

createQuestion['Simple subtraction'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.integerList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.integer();
    let b = a - solution;
    if (b < 0) {
      b = `(${b})`;
    }

    return {question: `${a}-${b}`, solution};
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
      if (c > a && a > 0) {
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

createQuestion['Evaluating expressions with one variable'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.integerList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let variableFirst = generate.boolean();
    let a = generate.integer();
    let b = generate.integer();
    let x = generate.letter();
    let c;
    if (generate.boolean()) {
      // addition
      c = solution - a * b;
      return variableFirst ?
        {
          question: `${a}${x}+${c >= 0 ? c : '(' + c + ')'}`,
          instruction: `Evaluate when ${x} is ${b}.`,
          solution: a * b + c
        } :
        {
          question: `${c}+${a >= 0 ? a + x : '(' + a + x + ')'}`,
          instruction: `Evaluate when ${x} is ${b}.`,
          solution
        };
    }

    // subtraction
    c = solution + a * b;
    return variableFirst ?
      {
        question: `${a}${x}-${c >= 0 ? c : '(' + c + ')'}`,
        instruction: `Evaluate when ${x} is ${b}.`,
        solution: a * b - c
      } :
      {
        question: `${c}-${a >= 0 ? a + x : '(' + a + x + ')'}`,
        instruction: `Evaluate when ${x} is ${b}.`,
        solution: c - a * b
      };
  });
};

createQuestion['Evaluating expressions with two variables'] =
    function(): Array<AssignmentQuestion> {
  let solutions = generate.integerList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.integer();
    let b = generate.integer();
    let c = generate.integer();
    let d = generate.integer();
    let x = generate.letter();
    let y = generate.letter([x]);
    let e, question;
    if (generate.boolean()) {
      // addition
      e = solution - a * b - c * d;
      if (e === 0) {
        question = `${a}${x}+${c}${y}`;
      } else if (e > 0) {
        question = `${a}${x}+${c}${y}+${e}`;
      } else {
        question = `${a}${x}+${c}${y}-${Math.abs(e)}`;
      }

    } else {
      // subtraction
      e = solution - a * b + c * d;
      if (e === 0) {
        question = c < 0 ?
          `${a}${x}-(${c}${y})` :
          `${a}${x}-${c}${y}`;
      } else if (e > 0) {
        question = c < 0 ?
          `${a}${x}-(${c}${y})+${e}` :
          `${a}${x}-${c}${y}+${e}`;
      } else {
        question = c < 0 ?
          `${a}${x}-(${c}${y})+${e}` :
          `${a}${x}-${c}${y}-${Math.abs(e)}`;
      }
    }

      return {
        question,
        instruction: `Evaluate when ${x} is ${b} and ${y} is ${d}.`,
        solution
      };
  });
};

createQuestion['Evaluating fractional expressions with two variables'] =
    function(): Array<AssignmentQuestion> {
  let solutions = generate.compositeList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let factor = generate.factor(solution);
    let other = solution * factor;
    let x = generate.letter();
    let y = generate.letter([x]);
    return {
      question: `${x}/${y}`,
      instruction: `Evaluate when ${x} is ${other} and ${y} is ${factor}.`,
      solution
    };
  });
};

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
    return {instruction: `Solve for ${x}.`, question: `${a}${x}=${b}`, solution};
  });
};

createQuestion['Solving equations of the form x/A = B'] = function(): Array<AssignmentQuestion> {
  let solutions = generate.compositeList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.factor(solution, [0]);
    let b = solution / a;
    let x = generate.letter();
    return {instruction: `Solve for ${x}.`, question: `${x}/${a}=${b}`, solution};
  });
};

createQuestion['Solving equations in one step with addition'] =
function(): Array<AssignmentQuestion> {
  let solutions = generate.integerList(...arguments);
  return solutions.map((solution: number): AssignmentQuestion => {
    let a = generate.integer([0]);
    let b = solution + a;
    let x = generate.letter();
    return {
      instruction: `Solve for ${x}.`,
      question: `${x}${a > 0 ? '+' : '-'}${Math.abs(a)}=${b}`,
      solution
    };
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
    return {instruction: `Solve for ${x}.`, question, solution};
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
    return {instruction: `Solve for ${x}.`, question: `${left}=${right}`, solution};
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
    return {instruction: `Solve for ${x}.`, question, solution};
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
    return {instruction: `Solve for ${x}.`, question: `${left}=${right}`, solution};
  });
};

function createFractionMultiplications(invert: boolean, count: number,
                                       exclude: Array<Numeric> = []): Array<AssignmentQuestion> {
  // TODO(gaye): There are better ways to do this, but for now
  //     we're going to pretend this is a search problem.
  //
  // {(a, b, c, d) in Z | a < b, c < d, (a / b) * (c / d) = solution
  //
  // Find the tuple in that set that minimizes the max of {a, b, c, d}
  function solutionToProblem(solution: string): ?AssignmentQuestion {
    let possible = [];
    for (let i = 1; i < 25; i++) {
      for (let j = i + 1; j < 25; j++) {
        for (let k = 1; k < 25; k++) {
          for (let l = k + 1; l < 25; l++) {
            possible.push({a: i, b: j, c: k, d: l});
          }
        }
      }
    }

    let magnitude = Math.abs(fraction.toDecimal(solution));
    possible = possible.filter(candidate => {
      let {a, b, c, d} = candidate;
      let actual = a / b * c / d;
      return Math.abs(actual) - Math.abs(magnitude) === 0;
    });

    if (!possible.length) {
      // uhh
      return null;
    }

    let {a, b, c, d} = min(possible, x => Math.max(x.a, x.b, x.c, x.d));
    let sign = solution.startsWith('-') ? '-' : '';
    return invert ?
      {question: `${sign}(${a}/${b})/(${d}/${c})`, solution} :
      {question: `${sign}(${a}/${b})*(${c}/${d})`, solution};
  }

  let problems = [];
  while (problems.length < count) {
    let solution = generate.compositeFraction(exclude);
    let problem = solutionToProblem(solution);
    if (problem) {
      exclude.push(solution);
      problems.push(problem);
    }
  }

  return problems;
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
