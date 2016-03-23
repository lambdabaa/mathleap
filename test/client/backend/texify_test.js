let {assert} = require('chai');
let texify = require('../../../client/backend/texify');

suite('backend/texify', () => {
  [
    ['1+1', '1+1'],
    ['2*x', '2x'],
    ['y>2*(x+1)', 'y>2\\left(x+1\\right)'],
    ['(3*y)/(x/2)=0', '\\frac{\\left(3y\\right)}{\\left(\\frac{x}{2}\\right)}=0'],
    ['3*|x+2|', '3|x+2|'],
    ['3x^2', '3x^{2}'],
    ['-2x', '-2x'],
    ['54/-6', '-\\frac{54}{6}']
  ].forEach(testCase => {
    test(testCase[0], () => assert.equal(texify(testCase[0]), testCase[1]));
  });
});
