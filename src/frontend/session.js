/* @flow */
/**
 * @fileoverview Reactive cookie abstraction.
 */

let {EventEmitter} = require('events');
let clone = require('lodash/lang/cloneDeep');
let debug = require('../common/debug')('session');
let forEach = require('lodash/collection/forEach');
let stringify = require('json-stringify-safe');

type Primitive = string | number | boolean;

class Session extends EventEmitter {
  constructor() {
    super();
    this._hydrate();
  }

  get(key: Primitive): any {
    return key ? this.data[key] : this.data;
  }

  async set(key: Primitive, value: any): Promise<void> {
    debug(`set ${key}=${stringify(value)}`);
    this.data[key] = value;
    super.emit('change');
    super.emit(key, value);

    await Promise.resolve();
    this._persist();
  }

  remove(key: Primitive): void {
    debug(`remove ${key}`);
    delete this.data[key];
    document.cookie = `${key}=null;expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    super.emit(key, null);
    super.emit('change');
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

    // Somehow we're not always deleting all of the session data.
    // We should investigate more thoroughly, but for now just nuke
    // everything.
    deleteAllCookies();
  }

  _hydrate(): void {
    this.data = {};
    let cookies = document.cookie.split(';');
    cookies.forEach((cookie: string): void => {
      cookie = cookie.trim();
      let split = cookie.indexOf('=');
      let key = cookie.slice(0, split);
      let value = cookie.slice(split + 1);
      this.data[key] = safeParse(value);
    });
  }

  _persist(expiration: string = getExpirationUTCString()): void {
    forEach(this.data, function(value: any, key: Primitive) {
      debug('persist', stringify({value, key, expiration}));
      // TODO: Hack!
      if (typeof value === 'object') {
        if ('assignments' in value) {
          debug('Found assignments!');
          value = clone(value);
          delete value.assignments;
        }

        value = stringify(value);
      }

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

function deleteAllCookies(): void {
  document.cookie.split(';').forEach((cookie: string): void => {
    let equalPos = cookie.indexOf('=');
    let key = equalPos !== -1 ?
      cookie.substr(0, equalPos) :
      cookie;
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
}

let session = module.exports = new Session();

session.on('newListener', async function(topic: string, fn: Function): Promise<void> {
  if (topic === 'change') {
    return;
  }

  await Promise.resolve();
  fn(session.get(topic));
});
