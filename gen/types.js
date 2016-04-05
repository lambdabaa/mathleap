/* @flow */

export type Backtracking = {
  root: (problem: any) => any;
  accept: (problem: any, candidate: any) => boolean;
  reject: (problem: any, candidate: any) => boolean;
  extend: (problem: any, candidate: any) => Array<any>;
};
