/* @flow */

function isElementVisible(el: HTMLElement): boolean {
  let {x, y} = getElementCenter(el);
  let candidate = document.elementFromPoint(x, y);
  while (candidate) {
    if (candidate === el) {
      return true;
    }

    candidate = candidate.parentNode;
  }

  return false;
}

function getElementCenter(el: HTMLElement): Object {
  let rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}

module.exports = isElementVisible;
