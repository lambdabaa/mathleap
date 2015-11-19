let {eachChar, mapChar} = require('../../src/common/string');

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
});
