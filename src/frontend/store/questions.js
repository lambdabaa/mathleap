let Firebase = require('firebase/lib/firebase-web');
let bridge = require('../bridge');
let debug = console.log.bind(console, '[store/questions]');
let {firebaseUrl} = require('../constants');
let flatten = require('lodash/array/flatten');
let groupBy = require('lodash/collection/groupBy');
let map = require('lodash/collection/map');
let mapValues = require('lodash/object/mapValues');
let pluck = require('lodash/collection/pluck');
let request = require('./request');
let sample = require('lodash/collection/sample');
let topics = Array.from(require('./topics'));
let values = require('lodash/object/values');

const topicsRef = new Firebase(`${firebaseUrl}/topics`);

let typeToQuestionsRef = {};

topics.forEach((topic, i) => {
  topic.types.forEach((questionType, j) => {
    typeToQuestionsRef[questionType.name] = topicsRef
      .child('' + i)
      .child('types')
      .child('' + j)
      .child('questions');
  });
});

/**
 * @param {Array} composition spec for assignment.
 */
exports.createAssignment = async function(composition) {
  let typeToCount = mapValues(
    groupBy(composition, part => part.type.name),
    parts => parts.reduce((total, part) => total + part.count, 0)
  );

  let typeToQuestions = {};
  await Promise.all(
    map(typeToCount, async function(count, type) {
      let cached = await readQuestionsFromCache(type, count);
      if (cached.length === count) {
        debug('We were able to read enough questions from the cache. Yay!');
        typeToQuestions[type] = cached;
        return;
      }

      debug('We need to generate some additional questions.');
      let generated = await bridge(
        'createQuestions',
        count - cached.length,
        type,
        {exclude: pluck(cached, 'solution')}
      );

      debug('Cache the generated questions.');
      await addQuestionsToCache(type, generated);
      debug('Cache OK.');
      typeToQuestions[type] = cached.concat(generated);
    })
  );

  return flatten(
    composition.map(part => {
      let type = part.type.name;
      let count = part.count;
      let questions = typeToQuestions[type];
      if (questions.length === count) {
        return questions;
      }

      // For whatever reason, the teacher decided to have multiple sections with
      // the same variety of question.
      return questions.splice(0, count);
    })
  );
};

async function readQuestionsFromCache(type, max) {
  debug('readQuestionsFromCache', JSON.stringify(arguments));
  let ref = typeToQuestionsRef[type];
  debug('Cache read ref', ref.toString());
  let questions = await request(ref, 'once', 'value');
  if (!questions) {
    debug('No cached questions', type);
    return [];
  }

  questions = values(questions);
  if (questions.length > max) {
    debug('Only need', max, 'of the', questions.length, type);
    return sample(questions, max);
  }

  return questions;
}

function addQuestionsToCache(type, questions) {
  debug('addQuestionsToCache', JSON.stringify(arguments));
  let ref = typeToQuestionsRef[type];
  return Promise.all(
    questions.map(question => {
      let childRef = ref.push();
      debug('Cache write ref', childRef.toString());
      return request(childRef, 'set', question);
    })
  );
}
