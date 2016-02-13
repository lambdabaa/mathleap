let {readFileSync} = require('fs');

suite('security rules', () => {
  test('can be parsed', () => {
    let manifest = readFirebaseSecurityRules();
    manifest.length.should.be.gt(0);
    (() => JSON.parse(manifest)).should.not.throw(SyntaxError);
  });
});

function readFirebaseSecurityRules() {
  return readFileSync(`${__dirname}/../../config/security.json`, 'utf8')
    .split('\n')
    .filter(line => !/^\s*\/\//.test(line))
    .join('\n');
}
