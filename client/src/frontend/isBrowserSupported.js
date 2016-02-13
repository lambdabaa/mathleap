/* @flow */

let bowser = require('bowser');

const supportedVersion = Object.freeze({
  chrome: 23,
  firefox: 28,
  opera: 12.1,
  msie: 11,
  safari: 6.1
});

function isBrowserSupported(): boolean {
  return bowser.mobile ? false : isDesktopBrowserSupported();
}

function isEditorSupported(): boolean {
  return bowser.mobile || bowser.tablet ?
    false :
    isDesktopBrowserSupported();
}

function isDesktopBrowserSupported(): boolean {
  for (let name in supportedVersion) {
    if (!bowser[name]) {
      continue;
    }

    let version = supportedVersion[name];
    return bowser.version >= version;
  }

  return true;
}

module.exports = isBrowserSupported;
module.exports.isEditorSupported = isEditorSupported;
module.exports.bowser = bowser;
