module.exports = function(event) {
  let chr;
  switch (event.keyCode) {
    case 54:
      if (event.shiftKey) chr = '^';
      break;
    case 56:
      if (event.shiftKey) chr = '*';
      break;
    case 61:
    case 187:
      if (event.shiftKey) chr = '+';
      break;
    case 173:
    case 179:
      chr = '-';
      break;
    case 191:
      chr = '/';
      break;
  }

  if (!chr) {
    if (event.keyCode < 48 || event.keyCode > 90) {
      return null;
    }

    chr = String.fromCharCode(event.keyCode).toLowerCase();
  }

  return chr;
};
