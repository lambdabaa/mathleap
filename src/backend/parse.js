/* @flow */
/**
 * @fileoverview Wrapper around jison parser for parsing math statements.
 */

let math = require('./math').parser;

export type Node = {nodeType: string; data: Array<any>};

math.yy = {
  createNode(nodeType: string, data: Array<any>): Node {
    return {nodeType, data};
  },

  append(batched: Node, node: Object): Node {
    let {nodeType, data} = batched;
    return math.yy.createNode(nodeType, data.concat(node));
  },

  abs(node: Object): Node {
    return math.yy.createNode('fun', ['abs', node]);
  }
};

module.exports = math.parse.bind(math);
