importScripts('node_modules/babel-core/browser-polyfill.min.js');

let {proxy} = require('proxyworker/lib/proxy');

proxy({
  methods: {
    createAssignment: require('./createAssignment'),
    diff: require('./diff'),
    parse: require('./parse'),
    ping: async function() {},
    stringify: require('./stringify')
  }
});
