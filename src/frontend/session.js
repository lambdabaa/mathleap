let EventEmitter = require('events').EventEmitter;
let inherits = require('util').inherits;

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
  // Write through cache.
  this.data[key] = value;
  if (typeof value === 'object') {
    value = value ? JSON.stringify(value) : '';
  }

  // Cookie should expire one month from now.
  let expiration = new Date();
  expiration.setMonth(expiration.getMonth() + 1);
  expiration = expiration.toUTCString();
  this.data.expires = expiration;

  // Persist to cookie store.
  for (let key in this.data) {
    let value = this.data[key];
    value = typeof value === 'object' ? JSON.stringify(value) : value;
    document.cookie = `${key}=${value}`;
  }

  this.emit('change');
  this.emit(key, value);
};

Session.prototype.clear = function() {
  let prev = this.data;
  this.data = {};

  // Expire the existing cookie.
  this.data.expires = 'Thu, 01 Jan 1970 00:00:00 UTC';
  document.cookie = `expires=${this.data.expires}`;

  this.emit('change');
  for (let key in prev) {
    this.emit(key, null);
  }
};

let session = module.exports = new Session();

session.on('newListener', (topic, fn) => {
  if (topic === 'change') {
    return;
  }

  process.nextTick(() => fn(session.get(topic)));
});
