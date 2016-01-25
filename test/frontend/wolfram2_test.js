let w2 = require('../../src/frontend/wolfram2');

// Disabled on ci since it costs money to query wolfram ;)
suite.skip('wolfram2', () => {
  test('#extractVariables', () => {
    w2.extractVariables('x=2-y')
    .should
    .deep
    .equal(['x', 'y']);
  });

  test('#extractVariables no variables', () => {
    w2.extractVariables('-12/2')
    .should
    .deep
    .equal([]);
  });

  test('#extractVariablesFromMany', () => {
    w2.extractVariablesFromMany('x+y=2', 'z=-x+2')
    .should
    .deep
    .equal(['x', 'y', 'z']);
  });

  test('#isEqual true', async () => {
    let equal = await w2.isEqual('x==2x+1', '-1==x');
    equal.should.equal(true);
  });

  test('#isEqual false', async () => {
    let equal = await w2.isEqual('x==2x+1', 'x==1');
    equal.should.equal(false);
  });

  test('#isEqual no variables', async () => {
    let equal = await w2.isEqual('6/3', '2');
    equal.should.equal(true);
  });
});
