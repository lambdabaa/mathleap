let isInteger = require('../../src/backend/isInteger');
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

  test('#superCompositeList', () => {
    let result = random.superCompositeList(10);
    result.forEach(checkSuperComposite);
    result.should.have.length(10);
  });

  test('#integer', () => {
    checkInteger(random.integer());
  });

  test('#composite', () => {
    checkComposite(random.composite());
  });

  test('#superComposite', () => {
    checkSuperComposite(random.superComposite());
  });

  test('#factor', () => {
    let factor = random.factor(24);
    checkInteger(factor);
    (24 / factor).should.equal(Math.floor(24 / factor));
  });

  test('#letter', () => {
    random.chrs.should.include(random.letter());
  });

  test('#nonZero', () => {
    let result = random.nonZero();
    checkInteger(result);
    result.should.not.equal(0);
  });

  test('#power', () => {
    let power = random.power();
    isInteger(power).should.equal(true);
    power.should.be.gte(-1000);
    power.should.be.lte(1000);
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

function checkSuperComposite(superComposite) {
  random.superComposites.should.include(superComposite);
}
