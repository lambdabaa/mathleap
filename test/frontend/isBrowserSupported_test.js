let isBrowserSupported = require('../../src/frontend/isBrowserSupported');

suite('isBrowserSupported', () => {
  [
    {test: 'ie 10', name: 'msie', version: 10, expect: false},
    {test: 'ie 11', name: 'msie', version: 11, expect: true},
    {test: 'ff 4', name: 'firefox', version: 4, expect: false},
    {test: 'ff 43', name: 'firefox', version: 43, expect: true}
  ].forEach(testCase => {
    test(testCase.test, () => {
      let bowser = isBrowserSupported.bowser;
      bowser[testCase.name] = true;
      bowser.version = testCase.version;
      isBrowserSupported().should.equal(testCase.expect);
    });
  });
});
