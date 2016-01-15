/* @flow */
/**
 * @fileoverview Reactive cookie abstraction.
 */

let {EventEmitter} = require('events');
let debug = console.log.bind(console, '[session]');
let forEach = require('lodash/collection/forEach');

type Primitive = string | number | boolean;

class Session extends EventEmitter {
  constructor() {
    super();
    this._hydrate();
  }

  get(key: Primitive): any {
    return key ? this.data[key] : this.data;
  }

  set(key: Primitive, value: any): void {
    debug(`set ${key}=${JSON.stringify(value)}`);
    this.data[key] = value;
    super.emit('change');
    super.emit(key, value);
    process.nextTick(() => this._persist());
  }

  clear(): void {
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

  _hydrate(): void {
    this.data = {};
    let cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      cookie = cookie.trim();
      let split = cookie.indexOf('=');
      let key = cookie.slice(0, split);
      let value = cookie.slice(split + 1);
      this.data[key] = safeParse(value);
    });
  }

  _persist(expiration: string = getExpirationUTCString()): void {
    forEach(this.data, (value, key) => {
      value = typeof value === 'object' ? JSON.stringify(value) : value;
      document.cookie = `${key}=${value};expires=${expiration}`;
    });
  }
}

function safeParse(value: any): any {
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
function getExpirationUTCString(): string {
  let expiration = new Date();
  expiration.setMonth(expiration.getMonth() + 1);
  return expiration.toUTCString();
}

let session = module.exports = new Session();

session.on('newListener', function(topic: string, fn: Function): void {
  if (topic === 'change') {
    return;
  }

  process.nextTick(() => fn(session.get(topic)));
});
