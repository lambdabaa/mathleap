let {EventEmitter} = require('events');
let {inherits} = require('util');

function Session() {
  // Hydrate cookie data.
  this.data = {};
  document.cookie.split(';').forEach(cookie => {
    let [key, value] = cookie.trim().split('=');
    let parsed;
    try {
      parsed = JSON.parse(value);
    } catch (error) {
      parsed = value;
    }

    this.data[key] = parsed;
  });
}

inherits(Session, EventEmitter);

Session.prototype.get = function(key) {
  return key ? this.data[key] : this.data;
};

Session.prototype.set = function(key, value) {
  this.data[key] = value;
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }

  this.data.expires = getExpiration();
  this._persist();
  this.emit(key, value);
};

Session.prototype.clear = function() {
  let prev = this.data;
  this.data = {expires: 'Thu, 01 Jan 1970 00:00:00 UTC'};
  this._persist();
  for (let key in prev) {
    this.emit(key, null);
  }
};

/**
 * Persist to cookie store.
 */
Session.prototype._persist = function() {
  for (let key in this.data) {
    let value = this.data[key];
    value = typeof value === 'object' ? JSON.stringify(value) : value;
    document.cookie = `${key}=${value}`;
  }

  this.emit('change');
};

/**
 * Cookie should expire one month from now.
 */
function getExpiration() {
  let expiration = new Date();
  expiration.setMonth(expiration.getMonth() + 1);
  return expiration.toUTCString();
}

let session = module.exports = new Session();

session.on('newListener', (topic, fn) => {
  if (topic === 'change') {
    return;
  }

  process.nextTick(() => fn(session.get(topic)));
});
