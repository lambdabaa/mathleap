let wolfram = require('../../src/frontend/wolfram');

suite('wolfram', () => {
  test('equation query', async function() {
    let res = await wolfram.executeQuery('x = 2(x + 1)');
    res.length.should.be.gt(0);
    let solution = wolfram.findSolution(res);
    solution.should.match(/^x\s*=\s*-2$/);
  });
});
