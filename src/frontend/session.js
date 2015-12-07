/**
 * @fileoverview Reactive cookie abstraction.
 */

let {EventEmitter} = require('events');
let debug = console.log.bind(console, '[session]');
let forEach = require('lodash/collection/forEach');

class Session extends EventEmitter {
  constructor() {
    super();
    this._hydrate();
  }

  get(key) {
    return key ? this.data[key] : this.data;
  }

  set(key, value) {
    debug(`set ${key}=${JSON.stringify(value)}`);
    this.data[key] = value;
    super.emit('change');
    super.emit(key, value);
    process.nextTick(() => this._persist());
  }

  clear() {
    debug('clear');
    // This will expire all of the cookies.
    this._persist('Thu, 01 Jan 1970 00:00:00 UTC');

    let prev = this.data;
    this.data = {};

    forEach(prev, (value, key) => {
      super.emit(key, null);
    });

    super.emit('change');
  }

  _hydrate() {
    this.data = {};
    let cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      let [key, value] = cookie.trim().split('=');
      this.data[key] = safeParse(value);
    });
  }

  _persist(expiration = getExpirationGMTString()) {
    forEach(this.data, (value, key) => {
      value = typeof value === 'object' ? JSON.stringify(value) : value;
      document.cookie = `${key}=${value};expires=${expiration}`;
    });
  }
}

function safeParse(value) {
  let result;
  try {
    result = JSON.parse(value);
  } catch (error) {
    result = value;
  }

  return result;
}

/**
 * Cookie should expire one month from now.
 */
function getExpirationGMTString() {
  let expiration = new Date();
  expiration.setMonth(expiration.getMonth() + 1);
  return expiration.toGMTString();
}

let session = module.exports = new Session();

session.on('newListener', (topic, fn) => {
  if (topic === 'change') {
    return;
  }

  process.nextTick(() => fn(session.get(topic)));
});
