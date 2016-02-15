/* @flow */
/**
 * @fileoverview Translate a keyboard event to a string character.
 */

type KeyboardEvent = {
  key: string;
  keyCode: number;
};

module.exports = function(event: KeyboardEvent): ?string {
  let chr;
  switch (event.key) {
    case ')':
    case '(':
    case '|':
    case '+':
    case '-':
    case '*':
    case '/':
    case '^':
      chr = event.key;
      break;
    default:
      break;
  }

  chr = chr || String.fromCharCode(event.keyCode).toLowerCase();
  return /^[0-9a-zA-Z\+\-\*\/\^$\(\)]$/.test(chr) ? chr : null;
};
