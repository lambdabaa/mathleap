/**
 * @fileoverview Wolfram alpha api client.
 */

let {DOMParser} = require('xmldom');
let Xhr = require('./xhr');
let debug = console.log.bind(console, '[wolfram]');
let identity = require('lodash/utility/identity');

const appId = 'Q3XHGL-AKGL7KJHR3';
const baseUrl = `http://api.wolframalpha.com/v2/query`;
const apiUrl = `${baseUrl}?appid=${appId}&format=plaintext`;

let parser = new DOMParser();

/**
 * Take some wolfram query like 'x = 2(x + 1)', send it along,
 * and resolve with the http response body.
 */
exports.executeQuery = function(query) {
  let input = encodeURIComponent(query);
  let request = new Xhr();
  request.open('GET', `${apiUrl}&input=${input}`);
  debug('issue query', query);
  return request.send();
};

/**
 * Parse wolfram's response xml and look for a solution pod.
 */
exports.findSolution = function(res) {
  debug('parsing solution from response', res);
  let doc = parser.parseFromString(res, 'text/xml');
  let node = getChildByTagName(
    getChildByTagName(
      getChildByTagName(
        getChildByTagName(doc, 'queryresult'),
        'pod',
        child => child.getAttribute('title') === 'Solution'
      ),
      'subpod'
    ),
    'plaintext'
  );

  return node.textContent
    .replace('', '=');
};

function getChildByTagName(element, tagName, test) {
  test = test || identity.bind(null, true);
  return getChild(element, child => child.tagName === tagName && test(child));
}

function getChild(element, test) {
  return Array.from(element.childNodes).find(test);
}
