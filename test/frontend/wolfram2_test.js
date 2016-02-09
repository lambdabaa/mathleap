let w2 = require('../../src/frontend/wolfram2');

suite('wolfram2', () => {
  test('#getVariables basic', () => {
    w2.getVariables('x+y=2', 'z=-x+2')
    .should
    .equal('{x,y,z}');
  });

  test('#getVariables substitution', () => {
    w2.getVariables(
      'x+y=2',
      'z=-x+2',
      'Evaluate when x is 3 and y is -2 and z is 1.'
    )
    .should
    .equal('{x==3,y==-2,z==1}');
  });

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

  suite('#isEqual', () => {
    test('true', async () => {
      let equal = await w2.isEqual('x==2x+1', '-1==x');
      equal.should.equal(true);
    });

    test('false', async () => {
      let equal = await w2.isEqual('x==2x+1', 'x==1');
      equal.should.equal(false);
    });

    test('no variables', async () => {
      let equal = await w2.isEqual('6/3', '2');
      equal.should.equal(true);
    });

    test('variable evaluation true', async () => {
      let equal = await w2.isEqual(
        '2x+y',
        '4',
        'Evaluate when x is 1 and y is 2.'
      );
      equal.should.equal(true);
    });

    test('variable evaluation false', async () => {
      let equal = await w2.isEqual(
        'x-2y',
        '5',
        'Evaluate when x is 1 and y is 2.'
      );
      equal.should.equal(false);
    });
  });
});
