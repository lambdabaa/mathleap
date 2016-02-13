/**
 * @fileoverview Expose worker methods over api bridge.
 */

importScripts('node_modules/babel-polyfill/dist/polyfill.min.js');

let {proxy} = require('proxyworker/lib/proxy');

proxy({
  methods: {
    createQuestions: require('./createAssignment').createQuestions,
    diff: require('./diff'),
    getPriority: require('./getPriority'),
    isCorrect: require('./isCorrect'),
    parse: require('./parse'),
    ping: async function() {},
    stringify: require('./stringify')
  }
});
