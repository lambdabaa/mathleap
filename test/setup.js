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
  <head>
    <script>
      ${require('fs').readFileSync(__dirname + '/../public/aws-sdk-2.2.48.min.js', {encoding: 'utf8'})}
    </script>
  </head>
  <body>
  </body>
  </html>
`);

global.window = document.defaultView;
Object.keys(window).forEach(key => {
  global[key] = global[key] || window[key];
});


// chai
global.should = require('chai').should();
