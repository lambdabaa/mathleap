let $ = document.querySelector.bind(document);
let Container = require('./components/Container');
let React = require('react');
let ReactDOM = require('react-dom');
let Router = require('./router');
let session = require('./session');

function main() {
  let hash = location.hash;
  if (hash.length < 2) {
    location.hash = '#!/home/';
  }

  let router = new Router({miss: require('./components/NotFound')});
  router.route('/home', require('./components/Home'));
  router.route('/classes', require('./components/classes/List'));
  router.route('/classes/:id', require('./components/classes/Show'));
  router.route('/classes/:aClass/assignments/new', require('./components/assignments/Create'));
  router.route(
    '/classes/:aClass/assignments/:assignment/submissions/:submission/edit',
    require('./components/submissions/Edit')
  );

  router.start();

  session.on('user', user => {
    // If we're on the home page and a user has logged in
    // we want to go to their dashboard. Otherwise, if
    // we're not on the home page and a user has logged out
    // we want to go to the home page.
    if (!!user !== (router.view !== '/home')) {
      location.hash = user ? '#!/classes/' : '#!/home/';
    }
  });

  ReactDOM.render(<Container router={router} />, $('#container'));
}

window.onload = main;
