/**
 * @fileoverview Wrapper around jison parser for parsing math statements.
 */

let math = require('./math').parser;

math.yy = {
  createNode: (nodeType, data) => {
    return {nodeType, data};
  },

  append: (batched, node) => {
    let {nodeType, data} = batched;
    return math.yy.createNode(nodeType, data.concat(node));
  }
};

module.exports = math.parse.bind(math);
