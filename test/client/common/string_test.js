let {eachChar, mapChar, filterChar, reduceChar} = require('../../../client/common/string');

suite('string', () => {
  test('#mapChar', () => {
    mapChar('hello', chr => chr)
    .should
    .deep
    .equal([
      'h',
      'e',
      'l',
      'l',
      'o'
    ]);
  });

  test('#filterChar', () => {
    filterChar('Ax=B', chr => {
      let code = chr.charCodeAt(0);
      return code >= 65 && code <= 90;
    })
    .should
    .deep
    .equal(['A', 'B']);
  });

  test('#eachChar', () => {
    let calledWith = [];
    eachChar('hello', chr => calledWith.push(chr));
    calledWith
      .should
      .deep
      .equal([
        'h',
        'e',
        'l',
        'l',
        'o'
      ]);
  });

  test('#reduceChar', () => {
    let result = [];
    reduceChar('foobar', (acc, next) => {
      acc.push(next);
      return acc;
    }, result)
    .should
    .deep
    .equal(['f', 'o', 'o', 'b', 'a', 'r']);
  });
});
