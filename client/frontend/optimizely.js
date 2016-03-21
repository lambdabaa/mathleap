/* @flow */

let intersection = require('lodash/array/intersection');
let sample = require('lodash/collection/sample');

exports.activate = function(experiments: Array<number> | number): void {
  let {optimizely} = window;
  if (!optimizely || !optimizely.push) {
    return;
  }

  if (!Array.isArray(experiments)) {
    experiments = [experiments];
  }

  experiments.forEach((experiment: number) => {
    optimizely.push(['activate', experiment]);
  });
};

exports.oneOf = function(experiments: Array<number>): number {
  let {optimizely} = window;
  if (!optimizely || !optimizely.push) {
    // Nothing matters if optimizely is missing.
    return experiments[0];
  }

  let {activeExperiments} = optimizely;
  let active = intersection(experiments, activeExperiments);
  if (active.length) {
    return active[0];
  }

  return sample(experiments);
};
