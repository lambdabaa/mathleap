/* @flow */

let bowser = require('bowser');

const supportedVersion = Object.freeze({
  chrome: 23,
  firefox: 28,
  opera: 12.1,
  msie: 11,
  safari: 6.1
});

module.exports = function(): boolean {
  for (let name in supportedVersion) {
    if (!bowser[name]) {
      continue;
    }

    let version = supportedVersion[name];
    return bowser.version >= version;
  }

  return true;
};

module.exports.bowser = bowser;
