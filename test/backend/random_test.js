let random = require('../../src/backend/random');

suite('random', () => {
  test('#integerList', () => {
    let result = random.integerList(10);
    result.forEach(checkInteger);
    result.should.have.length(10);
  });

  test('#compositeList', () => {
    let result = random.compositeList(10);
    result.forEach(checkComposite);
    result.should.have.length(10);
  });

  test('#integer', () => {
    checkInteger(random.integer());
  });

  test('#composite', () => {
    checkComposite(random.composite());
  });

  test('#factor', () => {
    let factor = random.factor(24);
    checkInteger(factor);
    (24 / factor).should.equal(Math.floor(24 / factor));
  });

  test('#letter', () => {
    random.chrs.should.include(random.letter());
  });
});

function checkInteger(integer) {
  integer.should.be.gt(-26);
  integer.should.be.lt(26);
  integer.toString().should.match(/^-?\d+$/);
}

function checkComposite(composite) {
  random.composites.should.include(composite);
}
