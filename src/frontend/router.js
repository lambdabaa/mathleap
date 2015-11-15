let {EventEmitter} = require('events');
let React = require('react');
let {inherits} = require('util');

function Router(options = {}) {
  this.routes = [];
  this.view = null;
  if ('miss' in options) {
    this.route('/404', options.miss);
    this.miss = options.miss;
  }
}

inherits(Router, EventEmitter);

Router.prototype.start = function() {
  window.onhashchange = () => this.emit('change');
};

Router.prototype.route = function(urlFormat, component) {
  let keys = [];
  let parts = urlFormat
    .split('/')
    .map(part => {
      if (part.charAt(0) !== ':') {
        return part;
      }

      keys.push(part.substring(1));
      return '([^\/]+)';
    })
    .filter(part => !!part.length);

  let regex = new RegExp(`^#!/${parts.join('\/')}\/?$`);
  this.routes.push((params = {}) => {
    let match = regex.exec(location.hash);
    if (match === null) {
      return false;
    }

    keys.forEach((key, index) => params[key] = match[index + 1]);
    this.view = urlFormat;
    return {
      element: React.createElement(component, params),
      params: params,
      view: urlFormat
    };
  });
};

Router.prototype.load = function(options) {
  let routes = this.routes;
  for (let i = 0; i < routes.length; i++) {
    let route = routes[i];
    let result = route(options);
    if (!result) {
      continue;
    }

    return result;
  }

  this.view = '/404';
  return {
    element: React.createElement(this.miss),
    params: {},
    view: '/404'
  };
};

module.exports = Router;
