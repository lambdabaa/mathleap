/* @flow */

let bridge = require('../bridge');
let charFromKeyEvent = require('../charFromKeyEvent');
let debug = require('../../common/debug')('helpers/editor');
let includes = require('lodash/collection/includes');
let {someValue} = require('../../common/array');
let stmt = require('../../common/stmt');
let submissions = require('../store/submissions');

import type {
  AssignmentSection,
  FBAssignment,
  FBResponse,
  Range
} from '../../common/types';

type Highlight = Array<boolean>;

let skipStops = Object.freeze(['=', '>', '≥', '<', '≤', '+', '-', '*', '/', '^']);

exports.getInstruction = function(assignment: FBAssignment, index: number): string {
  if (!Array.isArray(assignment.questions) || typeof index !== 'number') {
    return '';
  }

  let {question, instruction} = assignment.questions[index];

  if (instruction) {
    return instruction;
  }

  let section = getAssignmentSection(assignment, index);
  if (section) {
    if (typeof section.type.instruction === 'string') {
      return section.type.instruction;
    }

    if (typeof section.topic.instruction === 'string') {
      return section.topic.instruction;
    }
  }

  let stmtType = stmt.getStmtType(question);
  return stmtType === 'equation' || stmtType === 'inequality' ?
    `Solve the ${stmtType}.` :
    'Simplify the expression.';
};

exports.moveCursorLeft = function(cursor: number, equation: string): number {
  if (cursor === 0) {
    return 0;
  }

  do {
    cursor -= 1;
    let chr = equation.charAt(cursor);
    if (includes(skipStops, chr)) {
      break;
    }
  } while (cursor > 0);

  return cursor;
};

exports.moveCursorRight = function(cursor: number, equation: string): number {
  if (cursor === equation.length) {
    return equation.length;
  }

  do {
    cursor += 1;
    let chr = equation.charAt(cursor);
    if (includes(skipStops, chr)) {
      break;
    }
  } while (cursor < equation.length);

  return cursor;
};

exports.applyFirstChar = async function(event: Object, state: Object): Promise<Object> {
  let operator, status;
  switch (event.key) {
    case '+':
      status = 'Adding to both sides...';
      operator = event.key;
      break;
    case '-':
      status = 'Subtracting from both sides...';
      operator = event.key;
      break;
    case '*':
      status = 'Multiplying both sides...';
      operator = event.key;
      break;
    case '/':
      status = 'Dividing both sides...';
      operator = event.key;
      break;
    case '^':
      status = 'Raising both sides to a power...';
      operator = event.key;
      break;
    default:
      break;
  }

  debug('handle first char', operator);

  if (!operator) {
    debug('random characters typed...?');
    return;
  }

  let {equation, cursor} = state;
  let split = stmt.getStmtSplit(equation);
  cursor = cursor <= split ? split + 1 : equation.length + 2;

  let {left, right} = stmt.getLeftAndRight(equation);
  let [leftParens, rightParens] = await Promise.all(
    [left, right].map(async function(expression: string): Promise<boolean> {
      let expressionPriority = await bridge('getPriority', expression);
      // $FlowFixMe: Flow thinks operator wasn't initialized wtf?
      let operatorPriority = getOperatorPriority(operator);
      return operatorPriority > expressionPriority;
    })
  );

  return {append: operator, cursor, leftParens, rightParens, status, isStatusShown: true};
};

exports.applyBothSidesChar = function(event: Object, state: Object): ?Object {
  let {append, cursor, equation, leftParens, rightParens} = state;

  let offset;
  let split = stmt.getStmtSplit(equation);
  if (cursor <= split + append.length) {
    cursor = split + append.length;
    offset = 1;
  } else {
    cursor = equation.length + 2 * append.length;
    offset = 2;
  }

  if (event.key === 'Backspace') {
    append = append.slice(0, append.length - 1);
    cursor -= offset;
    if (!append.length) {
      leftParens = false;
      rightParens = false;
    }
  } else {
    let chr = charFromKeyEvent(event);
    if (!chr) {
      debug('Unable to resolve character from key event');
      return null;
    }

    append += chr;
    cursor += offset;
  }

  return {append, cursor, leftParens, rightParens};
};

exports.selectionToDiffArgs = function(event: Object, start: number,
                                       end: number): ?Array<any> {
  if (event.key === 'Backspace') {
    // TODO(gaye): Temporary workaround for
    //     https://github.com/gaye/ml/issues/79
    if (start === end) {
      return [
        {type: 'cancel', range: [start + 1 , end + 1]},
        start
      ];
    }

    return [
      {type: 'cancel', range: [start, end]},
      start
    ];
  }

  let chr = charFromKeyEvent(event);
  if (!chr) {
    debug('Unable to resolve character from key event');
    return null;
  }

  return [
    {type: 'replace', range: [start, end], replacement: chr},
    start + 1
  ];
};

exports.undoChar = function(undos: Array<Object>, redos: Array<Object>, state: Object): ?Object {
  if (!undos.length) {
    return null;
  }

  let next = undos.pop();
  redos.push(state);
  next.undos = undos;
  next.redos = redos;
  return next;
};

exports.redoChar = function(undos: Array<Object>, redos: Array<Object>, state: Object): ?Object {
  if (!redos.length) {
    return null;
  }

  let next = redos.pop();
  undos.push(state);
  next.undos = undos;
  next.redos = redos;
  return next;
};

/**
 * The goal here is to find the maximal contiguous highlights.
 */
exports.getHighlights = function(highlight: Highlight): Array<Range> {
  let result = [];
  let start = null;
  for (let i = 0; i < highlight.length; i++) {
    if (start === null) {
      // Possibly block start
      start = highlight[i] ? i : null;
      continue;
    }

    if (!highlight[i]) {
      // End of block
      result.push({start, end: i - 1});
      start = null;
      continue;
    }

    // Still in a block...
  }

  // Check to make sure we didn't end on a highlight.
  if (start !== null) {
    result.push({start, end: highlight.length - 1});
  }

  return result;
};

exports.commitDelta = async function(aClass: string, assignment: string,
                                     submission: string, responses: Array<FBResponse>,
                                     num: number, changes: Array<Array<number | string>>,
                                     equation: string, append: string,
                                     leftParens: boolean, rightParens: boolean): Promise<void> {
  let {work} = responses[num];
  let {left, right} = stmt.getLeftAndRight(equation);
  // Check whether we need to flip inequality direction.
  let symbol = stmt.getStmtSymbol(equation);
  let nextSymbol = isInequalityFlip(symbol, append) ?
    getOppositeStmtSymbol(symbol) :
    symbol;
  let result = right ?
    [
      {value: left, parens: leftParens},
      {value: right, parens: rightParens}
    ]
    .map(function(side: Object): string {
      let {value, parens} = side;
      return `${parens ? '(' : ''}${value}${parens ? ')' : ''}${append}`;
    })
    .join(nextSymbol) :
    left;

  try {
    await bridge('parse', result);
  } catch (error) {
    throw new Error('Bad math input');
  }

  await submissions.commitDelta(
    aClass,
    assignment,
    submission,
    num,
    work,
    [changes],
    [append],
    [result]
  );
};

exports.commitAnswer = async function(aClass: string, assignment: string,
                                      submission: string, responses: Array<FBResponse>,
                                      num: number, answer: string): Promise<void> {
  let {work} = responses[num];
  await submissions.commitAnswer(
    aClass,
    assignment,
    submission,
    num,
    work,
    [answer]
  );
};


exports.eventToCursorPosition = function(event: MouseEvent): number {
  // $FlowFixMe: Flow doesn't think that the event.target can be HTMLElement
  let element: HTMLElement = event.target;
  while (!element.classList.contains('submissions-edit-active')) {
    element = element.parentNode;
  }

  let rect = element.getBoundingClientRect();
  let eventX = event.clientX - rect.left;

  let children = Array.from(
    element.getElementsByClassName('submissions-edit-character')
  );

  let pos = someValue(
    children,
    function(childNode: HTMLElement, index: number): ?number {
      let childRect = childNode.getBoundingClientRect();
      let childLeft = childRect.left - rect.left;
      let childRight = childRect.right - rect.left;
      if (childRight >= eventX) {
        // Choose whichever of left side and right side of character
        // is closer to the event.
        let leftDist = Math.abs(childLeft - eventX);
        let rightDist = Math.abs(childRight - eventX);
        return leftDist < rightDist ? index : index + 1;
      }
    }
  );

  return typeof pos === 'number' ? pos : children.length - 1;
};

exports.applyDragToHighlight = function(highlight: Highlight, cursor: number,
                                        drag: number): Highlight {
  let prev;
  return highlight.map(function(value: boolean, index: number): boolean {
    if (drag == null ||
        index > cursor - 1 && index > drag ||
        index < cursor && index < drag) {
      return value;
    }

    if (prev != null) {
      return prev;
    }

    prev = !value;
    return prev;
  });
};

function getAssignmentSection(assignment: FBAssignment, index: number): ?AssignmentSection {
  let {composition} = assignment;
  if (!Array.isArray(composition)) {
    return null;
  }

  let count = 0;
  return composition.find((section: AssignmentSection): boolean => {
    count += section.count;
    return count > index;
  });
}

function getOperatorPriority(operator: string): number {
  switch (operator) {
    case '+':
    case '-':
      return 0;
    case '*':
      return 1;
    case '/':
      return 2;
    case '^':
      return 3;
    default:
      throw new Error(`Unexpected operator ${operator}`);
  }
}

function isInequalityFlip(symbol: string, append: string): boolean {
  debug('test inequality flip', symbol, append);
  if (symbol === '=') {
    return false;
  }

  return /^[*,/]-.+$/.test(append);
}

function getOppositeStmtSymbol(symbol: string): string {
  switch (symbol) {
    case '>':
      return '<';
    case '<':
      return '>';
    case '≥':
      return '≤';
    case '≤':
      return '≥';
    default:
      throw new Error(`${symbol} has no opposite`);
  }
}
