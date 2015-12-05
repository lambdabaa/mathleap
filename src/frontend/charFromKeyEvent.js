/**
 * @fileoverview Translate a keyboard event to a string character.
 */

module.exports = function(event) {
  let chr;
  switch (event.keyCode) {
    case 54:
      if (event.shiftKey) { chr = '^'; }
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
  return chr;
};
