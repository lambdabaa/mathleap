/* @flow */
/**
 * @fileoverview Main application frontend entrypoint.
 */

let $ = document.querySelector.bind(document);
let AppContainer = require('./components/AppContainer');
let React = require('react');
let ReactDOM = require('react-dom');
let Router = require('./router');
let session = require('./session');

function main(): void {
  let router = createRouter();
  observeLocation(router);
  router.start();
  ReactDOM.render(
    <AppContainer router={router} />,
    $('#container'),
    () => {
      [
        5357871655,
        5384611902,
        5370741565,
        5384720737
      ].forEach((experimentId: number) => {
        window.optimizely.push(['activate', experimentId]);
      });
    }
  );
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
      case '/common-core':
      case '/documentation':
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
  router.route('/home', require('./components/HomeContainer'));
  router.route('/common-core', require('./components/CommonCore'));
  router.route('/documentation', require('./components/submissions/Documentation'));
  router.route('/privacy', require('./components/Privacy'));
  router.route('/tos', require('./components/Tos'));
  router.route('/practice', require('./components/PracticeContainer'));
  router.route('/practice/new', require('./components/assignments/CreateContainer'));
  router.route('/practice/:id', require('./components/submissions/ShowContainer'));
  router.route('/practice/:id/edit', require('./components/submissions/EditContainer'));
  router.route('/classes', require('./components/classes/List'));
  router.route('/classes/:id', require('./components/classes/Show'));
  router.route(
    '/classes/:aClass/assignments/new',
    require('./components/assignments/CreateContainer')
  );
  router.route(
    '/classes/:aClass/assignments/:assignment',
    require('./components/assignments/ShowContainer')
  );
  router.route(
    '/classes/:aClass/assignments/:assignment/insights',
    require('./components/assignments/InsightsContainer')
  );
  router.route(
    '/classes/:aClass/assignments/:assignment/submissions/:submission',
    require('./components/submissions/ShowContainer')
  );
  router.route(
    '/classes/:aClass/assignments/:assignment/submissions/:submission/edit',
    require('./components/submissions/EditContainer')
  );

  router.route(
    /^#[^\/]*access_token=[^\/]*$/,
    require('./components/EdmodoHandler')
  );

  return router;
}

window.onload = main;
