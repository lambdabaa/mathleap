let {assert} = require('chai');
let getNestedKeyValue = require('../../../client/backend/getNestedKeyValue');

suite('getNestedKeyValue', () => {
  test('top level', () => {
    getNestedKeyValue(
      {foo: 'bar', baz: 'qux'},
      'baz'
    )
    .should
    .equal('qux');
  });

  test('missing', () => {
    assert.equal(
      getNestedKeyValue(
        {foo: 'bar'},
        'baz'
      ),
      null
    );
  });

  test('nested', () => {
    getNestedKeyValue(
      {foo: {bar: 'baz'}},
      'bar',
    )
    .should
    .equal('baz');
  });
});
