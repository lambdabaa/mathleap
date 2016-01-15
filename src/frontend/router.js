/* @flow */
/**
 * @fileoverview Tiny client-side router implementation based on hashchange.
 */

let {EventEmitter} = require('events');
let React = require('react');
let {inherits} = require('util');
let {someValue} = require('../common/array');

type Route = {
  element: Object;
  params: Object;
  view: string;
};

function Router(options: Object = {}) {
  this.routes = [];
  if ('miss' in options) {
    this.route('/404', options.miss);
    this.miss = options.miss;
  }
}

inherits(Router, EventEmitter);

Router.prototype.view = null;

Router.prototype.start = function(): void {
  window.onhashchange = () => this.emit('change');
};

Router.prototype.route = function(urlFormat: string, component: Function): void {
  let keys = [];
  let parts = urlFormat
    .split('/')
    .map(function(part): string {
      if (part.charAt(0) !== ':') {
        return part;
      }

      keys.push(part.substring(1));
      return '([^\/]+)';
    })
    .filter(function(part): boolean {
      return !!part.length;
    });

  let regex = new RegExp(`^#!/${parts.join('\/')}\/?$`);
  this.routes.push(function(params: Object = {}): Route | boolean {
    let match = regex.exec(location.hash);
    if (match === null) {
      return false;
    }

    this.view = urlFormat;
    keys.forEach(function(key: string, index: number): void {
      params[key] = match[index + 1];
    });

    return {
      element: React.createElement(component, params),
      params,
      view: urlFormat
    };
  }.bind(this));
};

Router.prototype.load = function(options) {
  let result = someValue(this.routes, route => route(options));
  if (result) {
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
