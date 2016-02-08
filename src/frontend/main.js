/* @flow */
/**
 * @fileoverview Main application frontend entrypoint.
 */

let $ = document.querySelector.bind(document);
let Container = require('./components/Container');
let React = require('react');
let ReactDOM = require('react-dom');
let Router = require('./router');
let session = require('./session');

function main(): void {
  let router = createRouter();
  observeLocation(router);
  ReactDOM.render(<Container router={router} />, $('#container'));
  session.remove('__svid');
  session.remove('__svee');
}

function observeLocation(router: Router): void {
  let hash = location.hash;
  if (hash.length < 2) {
    location.hash = '#!/home/';
  }

  session.on('user', function(user: Object): void {
    if (user) {
      if (router.view === '/home' || router.view instanceof RegExp) {
        location.hash = '#!/classes/';
      }

      return;
    }

    // Hack to get around edmodo callback url fake view
    // redirecting to homepage.
    if (router.view instanceof RegExp) {
      return;
    }

    switch (router.view) {
      case '/home':
      case '/privacy':
      case '/tos':
        break;
      default:
        // User is logged out and viewing a page only logged in users
        // should be able to. Kick them back to homepage.
        location.hash = '#!/home/';
    }
  });
}

function createRouter(): Router {
  let router = new Router({miss: require('./components/NotFound')});
  router.route('/home', require('./components/Home'));
  router.route('/tos', require('./components/Tos'));
  router.route('/privacy', require('./components/Privacy'));
  router.route('/practice', require('./components/Practice'));
  router.route('/practice/new', require('./components/assignments/Create'));
  router.route('/practice/:id', require('./components/submissions/Show'));
  router.route('/practice/:id/edit', require('./components/submissions/Edit'));
  router.route('/classes', require('./components/classes/List'));
  router.route('/classes/:id', require('./components/classes/Show'));
  router.route(
    '/classes/:aClass/assignments/new',
    require('./components/assignments/Create')
  );
  router.route(
    '/classes/:aClass/assignments/:assignment',
    require('./components/assignments/Show')
  );
  router.route(
    '/classes/:aClass/assignments/:assignment/submissions/:submission',
    require('./components/submissions/Show')
  );
  router.route(
    '/classes/:aClass/assignments/:assignment/submissions/:submission/edit',
    require('./components/submissions/Edit')
  );

  router.route(
    /^#[^\/]*access_token=[^\/]*$/,
    require('./components/EdmodoHandler')
  );

  router.start();
  return router;
}

window.onload = main;
