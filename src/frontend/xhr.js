/**
 * @fileoverview Promises wrapper around XMLHttpRequest.
 */

let {XMLHttpRequest} = require('../common/polyfill')(
  'XMLHttpRequest',
  'xmlhttprequest'
);

export default class Xhr {
  constructor(options) {
    this.transport = new XMLHttpRequest(options);

    /* readwrite */
    [
      'response',
      'responseText',
      'responseType',
      'responseXML',
      'timeout',
      'upload',
      'withCredentials'
    ].forEach(attribute => {
      Object.defineProperty(this, attribute, {
        get: function() { return this.transport[attribute]; },
        set: function(value) { this.transport[attribute] = value; }
      });
    });

    /* readonly */
    [
      'status',
      'statusText'
    ].forEach(attribute => {
      Object.defineProperty(this, attribute, {
        get: function() { return this.transport[attribute]; }
      });
    });
  }

  abort() {
    return this._callNative('abort', arguments);
  }

  getAllResponseHeaders() {
    return this._callNative('getAllResponseHeaders', arguments);
  }

  getResponseHeader() {
    return this._callNative('getResponseHeader', arguments);
  }

  open() {
    return this._callNative('open', arguments);
  }

  overrideMimeType() {
    return this._callNative('overrideMimeType', arguments);
  }

  send(data) {
    let transport = this.transport;
    transport.send(data);
    return new Promise(function(resolve, reject) {
      transport.onreadystatechange = function() {
        if (transport.readyState !== 4 /* done */) {
          return;
        }

        if (transport.status < 200 || transport.status >= 400) {
          return reject(new Error(`Bad status: ${transport.status}`));
        }

        return resolve(transport.responseText);
      };

      transport.ontimeout = function() {
        reject(new Error(`Request timed out after ${transport.timeout} ms`));
      };
    });
  }

  _callNative(method, args) {
    return this.transport[method].apply(this.transport, args);
  }
}
