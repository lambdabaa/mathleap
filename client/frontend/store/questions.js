/* @flow */

let bridge = require('../bridge');
let createSafeFirebaseRef = require('../createSafeFirebaseRef');
let debug = require('../../common/debug')('store/questions');
let flatten = require('lodash/array/flatten');
let groupBy = require('lodash/collection/groupBy');
let map = require('lodash/collection/map');
let mapValues = require('lodash/object/mapValues');
let pluck = require('lodash/collection/pluck');
let request = require('./request');
let sample = require('lodash/collection/sample');
let stringify = require('../../common/stringify');
let topics = Array.from(require('./topics'));
let values = require('lodash/object/values');

import type {
  AssignmentQuestion,
  AssignmentSection
} from '../../common/types';

const topicsRef = createSafeFirebaseRef('topics');

let typeToQuestionsRef = {};

topics.forEach(function(topic: Object, i: number): void {
  topic.types.forEach(function(questionType: Object, j: number): void {
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
exports.createAssignment = async function(
    composition: Array<AssignmentSection>): Promise<Array<AssignmentQuestion>> {
  let typeToCount = mapValues(
    groupBy(
      composition,
      function(part: AssignmentSection): string {
        return part.type.name;
      }
    ),
    function(parts: Array<AssignmentSection>): number {
      return parts.reduce(function(total: number, part: AssignmentSection): number {
        return total + part.count;
      }, 0);
    }
  );

  let typeToQuestions = {};
  await Promise.all(
    map(
      typeToCount,
      async function(count: number, type: string): Promise<void> {
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
      }
    )
  );

  return flatten(
    composition.map(function(part: AssignmentSection): Array<AssignmentQuestion> {
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

async function readQuestionsFromCache(type: string,
                                      max: number): Promise<Array<AssignmentQuestion>> {
  debug('readQuestionsFromCache', stringify(arguments));
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

function addQuestionsToCache(type: string, questions: Array<AssignmentQuestion>): Promise {
  debug('addQuestionsToCache', stringify(arguments));
  let ref = typeToQuestionsRef[type];
  return Promise.all(
    questions.map(question => {
      let childRef = ref.push();
      debug('Cache write ref', childRef.toString());
      return request(childRef, 'set', question);
    })
  );
}
