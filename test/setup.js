require('babel-core/register')(
  JSON.parse(
    require('fs').readFileSync(
      __dirname + '/../.babelrc'
    )
  )
);
require('babel-polyfill');
require('chai').should();
