/* @flow */
/* global Generator */

let backtracking = require('./backtracking');
let clone = require('lodash/lang/cloneDeep');
let debug = require('../client/common/debug')('listProblems');
let {filterChar, mapChar} = require('../client/common/string');
let range = require('lodash/utility/range');
let uniq = require('lodash/array/uniq');
let values = require('lodash/object/values');

type Problem = {
  format: string;
  constraints: Array<string>;
};

function* listProblems(aProblem: Problem): Generator {
  let bt = backtracking(aProblem, {
    root: (problem: any) => {
      let {format} = problem;
      let vars = uniq(filterChar(format, isAlpha));
      let assignment = {};
      vars.forEach((aVar: string) => {
        assignment[aVar] = '_';
      });

      debug('root', JSON.stringify(assignment));
      return assignment;
    },

    accept: (problem: any, assignment: any): boolean => {
      return values(assignment).every(value => value !== '_');
    },

    reject: (problem: any, assignment: any): boolean => {
      let {constraints} = problem;
      constraints = constraints.map(constraint => {
        return mapChar(constraint, (chr: string): string => {
          return chr in assignment ? assignment[chr] : chr;
        }).join('');
      });

      return constraints.some(constraint => {
        if (constraint.indexOf('_') !== -1) {
          // Haven't assigned enough to evaluate this constraint yet.
          return false;
        }

        return !eval(constraint);
      });
    },

    extend: (problem: any, assignment: any): Array<any> => {
      // Find the first thing that isn't already decided.
      let keys = Object.keys(assignment);
      let key = keys.sort().find(aKey => assignment[aKey] === '_');
      if (key == null) {
        return [];
      }

      return range(-25, 26).map(x => {
        let parent = clone(assignment);
        parent[key] = x;
        return parent;
      });
    }
  });

  for (let next of bt) {
    let stmt = aProblem.format;
    let vars = {};
    for (let key in next) {
      let value = next[key];
      if (isLowerCase(key)) {
        vars[key] = value;
        continue;
      }

      stmt = stmt.replace(new RegExp(key, 'g'), '' + value);
    }

    yield {stmt, vars};
  }
}

function isAlpha(chr: string): boolean {
  return isUpperCase(chr) || isLowerCase(chr);
}

function isUpperCase(chr: string): boolean {
  let code = chr.charCodeAt(0);
  return code >= 65 && code <= 90;
}

function isLowerCase(chr: string): boolean {
  let code = chr.charCodeAt(0);
  return code >= 97 && code <= 122;
}

module.exports = listProblems;
