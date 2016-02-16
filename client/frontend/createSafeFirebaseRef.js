/* @flow */

let Firebase = require('firebase/lib/firebase-web');
let {firebaseUrl} = require('./constants');

class SafeFirebase extends Firebase {
  constructor(uri) {
    super(uri);
    this.uri = uri;
  }

  child(path) {
    path = '' + path;  // coerce to string
    return new SafeFirebase(
      this.uri +
      '/' +
      path
        .split('/')
        .filter((part: string): boolean => !!part.length)
        .map(encodeURIComponent)
        .join('/')
    );
  }
}

function createSafeFirebaseRef(path: string = ''): SafeFirebase {
  return new SafeFirebase(
    [firebaseUrl]
      .concat(
        path
          .split('/')
          .filter((part: string): boolean => !!part.length)
          .map(encodeURIComponent)
      )
      .join('/')
  );
}

module.exports = createSafeFirebaseRef;
module.exports.SafeFirebase = SafeFirebase;
