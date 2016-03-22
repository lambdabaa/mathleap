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

exports.getPermissions = getPermissions;
exports.setRouter = setRouter;
