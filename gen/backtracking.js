/* @flow */
/* global Generator */
/**
 * @fileoverview Streaming backtracking.
 */

import type {Backtracking} from './types';

function* backtracking(problem: any, options: Backtracking): Generator {
  let queue = [options.root(problem)];
  while (queue.length) {
    let candidate = queue.shift();
    if (options.reject(problem, candidate)) {
      continue;
    }

    if (options.accept(problem, candidate)) {
      yield candidate;
    }

    options
      .extend(problem, candidate)
      .forEach(extension => queue.push(extension));
  }
}

module.exports = backtracking;
