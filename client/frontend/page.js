/* @flow */

let Router = require('./router');

let router: ?Router = null;

function getPermissions(): string {
  if (!router) {
    throw new Error('page needs a router!');
  }

  switch (router.view) {
    case '/common-core':
    case '/documentation':
    case '/home':
    case '/press':
    case '/privacy':
    case '/tos':
      return 'open';
    default:
      return 'restricted';
  }
}

function setRouter(value: Router) {
  router = value;
}

function setTitle(): void {
  if (!router) {
    return;
  }

  let subtitle;
  if (getPermissions() === 'restricted') {
    subtitle = 'Math Assignments Made Easy';
  } else {
    switch (router.view) {
      case '/common-core':
        subtitle = 'Common Core';
        break;
      case '/documentation':
        subtitle = 'Documentation';
        break;
      case '/press':
        subtitle = 'Press';
        break;
      case '/privacy':
        subtitle = 'Privacy';
        break;
      case '/tos':
        subtitle = 'Terms of Service';
        break;
      default:
        subtitle = 'Math Assignments Made Easy';
        break;
    }
  }

  let title = `MathLeap | ${subtitle}`;
  if (!document.title || document.title !== title) {
    document.title = title;
    let element = document.head.querySelector('title');
    element.textContent = title;
  }
}

exports.getPermissions = getPermissions;
exports.setRouter = setRouter;
exports.setTitle = setTitle;
