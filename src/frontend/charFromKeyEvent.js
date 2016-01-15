/* @flow */
/**
 * @fileoverview Translate a keyboard event to a string character.
 */

type KeyboardEvent = {
  keyCode: number;
  shiftKey: boolean;
};

module.exports = function(event: KeyboardEvent): ?string {
  let chr;
  switch (event.keyCode) {
    case 48:
      if (event.shiftKey) { chr = ')'; }
      break;
    case 54:
      if (event.shiftKey) { chr = '^'; }
      break;
    case 57:
      if (event.shiftKey) { chr = '('; }
      break;
    case 56:
      if (event.shiftKey) { chr = '*'; }
      break;
    case 61:
    case 187:
      if (event.shiftKey) { chr = '+'; }
      break;
    case 173:
    case 179:
    case 189:
      chr = '-';
      break;
    case 191:
      chr = '/';
      break;
    default:
      break;
  }

  chr = chr || String.fromCharCode(event.keyCode).toLowerCase();
  return /^[0-9a-zA-Z\+\-\*\/\^$\(\)]$/.test(chr) ? chr : null;
};
