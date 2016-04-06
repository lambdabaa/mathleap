/* @flow */

let $ = document.querySelector.bind(document);
let React = require('react');
let ReactDOM = require('react-dom');
let UI = require('./UI');

function main() {
  ReactDOM.render(<UI />, $('#container'));
}

window.onload = main;
