/**
 * @fileoverview Main application frontend entrypoint.
 */

let $ = document.querySelector.bind(document);
let Container = require('./components/Container');
let React = require('react');
let ReactDOM = require('react-dom');
let Router = require('./router');
let session = require('./session');

function main() {
  let router = createRouter();
  observeLocation(router);
  ReactDOM.render(<Container router={router} />, $('#container'));
}

function observeLocation(router) {
  let hash = location.hash;
  if (hash.length < 2) {
    location.hash = '#!/home/';
  }

  session.on('user', user => {
    // If we're on the home page and a user has logged in
    // we want to go to their dashboard. Otherwise, if
    // we're not on the home page and a user has logged out
    // we want to go to the home page.
    if (!!user !== (router.view !== '/home')) {
      location.hash = user ? '#!/classes/' : '#!/home/';
    }
  });

}

function createRouter() {
  let router = new Router({miss: require('./components/NotFound')});
  router.route('/home', require('./components/Home'));
  router.route('/classes', require('./components/classes/List'));
  router.route('/classes/:id', require('./components/classes/Show'));
  router.route(
    '/classes/:aClass/assignments/new',
    require('./components/assignments/Create')
  );
  router.route(
    'classes/:aClass/assignments/:assignment/submissions/:submission',
    require('./components/submissions/Show')
  );
  router.route(
    '/classes/:aClass/assignments/:assignment/submissions/:submission/edit',
    require('./components/submissions/Edit')
  );

  router.start();
  return router;
}

window.onload = main;
