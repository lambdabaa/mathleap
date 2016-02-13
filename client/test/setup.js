// babel
require('babel-polyfill');
require('babel-core/register')(
  JSON.parse(
    require('fs').readFileSync(
      __dirname + '/../.babelrc'
    )
  )
);

// jsdom
global.document = require('jsdom').jsdom(`
  <!DOCTYPE html>
  <html>
  <head></head>
  <body></body>
  </html>
`);

global.window = document.defaultView;
Object.keys(window).forEach(key => {
  global[key] = global[key] || window[key];
});

// chai
global.should = require('chai').should();
