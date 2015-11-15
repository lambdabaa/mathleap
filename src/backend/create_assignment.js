let debug = console.log.bind(console, '[service/createAssignment]');
let flatten = require('lodash/array/flatten');
let groupBy = require('lodash/collection/groupBy');
let mapValues = require('lodash/object/mapValues');
let random = require('./random');

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

createQuestion['Solving equations in two steps'] = () => {
  // TODO
};

createQuestion['Equations with variables on both sides'] = () => {
  // TODO
};

createQuestion['Simple distribution'] = () => {
  // TODO
};

createQuestion['Clever distribution'] = () => {
  // TODO
};

createQuestion['Applying operations to both sides'] = () => {
  // TODO
};

createQuestion['Combining like terms'] = () => {
  // TODO
};

createQuestion['Complex two variable linear equations'] = () => {
  // TODO
};

createQuestion['Finding axis intercepts'] = () => {
  // TODO
};

createQuestion['Multiplying and dividing with inequalities'] = () => {
  // TODO
};

createQuestion['Solving two-step inequalities'] = () => {
  // TODO
};

createQuestion['Complex inequalities'] = () => {
  // TODO
};

createQuestion['Absolute value inequalities'] = () => {
  // TODO
};

createQuestion['Two equations in two variables'] = () => {
  // TODO
};

createQuestion['Three equations in three variables'] = () => {
  // TODO
};

createQuestion['Solving quadratic equations by taking the square root'] = () => {
  // TODO
};

createQuestion['Solving quadratic equations by factoring'] = () => {
  // TODO
};

createQuestion['Solving quadratic equations by completing the square'] = () => {
  // TODO
};

createQuestion['Using the quadratic equation'] = () => {
  // TODO
};

module.exports = createAssignment;
