let {partition} = require('./array');

let symbol = Object.freeze({
  equals: '=',
  lt: '<',
  lteq: '≤',
  gteq: '≥',
  gt: '>'
});

let handleNode = {};

handleNode.statement = node => {
  let [statement, left, right] = node.data;
  return `${stringify(left)} ${symbol[statement]} ${stringify(right)}`;
};

handleNode.termlist = (node, parentPriority) => {
  let result = node.data
    .map((term, index) => {
      return index === 0 ?
        `${term.negate ? '-' : ''}${stringify(term.value, 2)}` :
        `${term.negate ? '-' : '+'} ${stringify(term.value, 2)}`;
    })
    .join(' ');

  return parentPriority < 2 ? `(${result})` : result;
};

handleNode.factorlist = (node, parentPriority) => {
  let [top, bottom] = partition(node.data, factor => !factor.invert);
  let topstring = top.length ?
    top.map(x => stringify(x.value, 1)).join(' * ') :
    '1';
  let bottomstring = bottom.map(x => stringify(x.value, 1)).join(' * ');

  if (!bottom.length) {
    return topstring;
  }

  if (top.length > 1) {
    topstring = `(${topstring})`;
  }

  if (bottom.length > 1) {
    bottomstring = `(${bottomstring})`;
  }

  let result = `${topstring} / ${bottomstring}`;
  return parentPriority < 1 ? `(${result})` : result;
};

handleNode.fun = node => {
  let funType = node.data[0];
  switch (funType) {
    case 'abs':
      return `|${stringify(node.data[1])}|`;
    case 'power':
      return `${stringify(node.data[1], 0)} ^ ${stringify(node.data[2], 0)}`;
    default:
      throw new Error(`Unrecognized funType ${funType}`);
  }
};

handleNode.atom = node => {
  return node.data[1].toString();
};

function stringify(node, parentPriority = Infinity) {
  return handleNode[node.nodeType](node, parentPriority);
}

module.exports = stringify;
