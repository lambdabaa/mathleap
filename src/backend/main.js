/**
 * @fileoverview Expose worker methods over api bridge.
 */

importScripts('node_modules/babel-core/browser-polyfill.min.js');

let {proxy} = require('proxyworker/lib/proxy');

proxy({
  methods: {
    createQuestions: require('./createAssignment').createQuestions,
    diff: require('./diff'),
    getPriority: require('./getPriority'),
    parse: require('./parse'),
    ping: async function() {},
    stringify: require('./stringify')
  }
});
