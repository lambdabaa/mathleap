let parse = require('./parse');

/**
 * 0: add, subtract
 * 1: multiply
 * 2: divide
 * 3: fun
 * 4: atom
 */
module.exports = function getPriority(expression) {
  let node;
  try {
    node = typeof expression === 'string' ? parse(expression) : expression;
  } catch (error) {
    throw new Error(`Failed to parse expression ${JSON.stringify(expression)}: ${error.message}`);
  }

  let {nodeType, data} = node;
  if (data.length === 1) {
    return getPriority(data[0].value);
  }

  switch (nodeType) {
    case 'termlist':
      return 0;
    case 'factorlist':
      return isDivide(node) ? 2 : 1;
    case 'fun':
      return 3;
    case 'atom':
      return 4;
    default:
      throw new Error(`Unexpected nodeType ${node.nodeType}`);
  }
};

function isDivide(factorlist) {
  return factorlist.data.some(factor => factor.invert);
}
