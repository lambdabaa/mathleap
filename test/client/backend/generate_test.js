let generate = require('../../../client/backend/generate');
let isInteger = require('../../../client/backend/isInteger');

suite('generate', () => {
  test('#integerList', () => {
    let result = generate.integerList(10);
    result.forEach(checkInteger);
    result.should.have.length(10);
  });

  test('#compositeList', () => {
    let result = generate.compositeList(10);
    result.forEach(checkComposite);
    result.should.have.length(10);
  });

  test('#superCompositeList', () => {
    let result = generate.superCompositeList(10);
    result.forEach(checkSuperComposite);
    result.should.have.length(10);
  });

  test('#integer', () => {
    checkInteger(generate.integer());
  });

  test('#composite', () => {
    checkComposite(generate.composite());
  });

  test('#superComposite', () => {
    checkSuperComposite(generate.superComposite());
  });

  test('#factor', () => {
    let factor = generate.factor(24);
    checkInteger(factor);
    (24 / factor).should.equal(Math.floor(24 / factor));
  });

  test('#letter', () => {
    generate.chrs.should.include(generate.letter());
  });

  test('#power', () => {
    let power = generate.power();
    isInteger(power).should.equal(true);
    power.should.be.gte(-1000);
    power.should.be.lte(1000);
  });

  test('#fraction', () => {
    let fraction = generate.fraction();
    fraction.should.match(/^-?\d+\/\d+$/);
    let [numerator, denominator] = fraction.split('/').map(num => parseInt(num));
    checkInteger(numerator);
    checkInteger(denominator);
    Math.abs(numerator).should.be.lte(Math.abs(denominator));
  });

  test('#fractionList', () => {
    let result = generate.fractionList(10);
    result.should.have.length(10);
    result.forEach(fraction => {
      fraction.should.match(/^-?\d+\/\d+$/);
      let [numerator, denominator] = fraction.split('/').map(num => parseInt(num));
      checkInteger(numerator);
      checkInteger(denominator);
      Math.abs(numerator).should.be.lte(Math.abs(denominator));
    });
  });

  test('#compositeFraction', () => {
    let fraction = generate.compositeFraction();
    fraction.should.match(/^-?\d+\/\d+$/);
    let [numerator, denominator] = fraction.split('/').map(num => parseInt(num));
    checkInteger(numerator);
    checkInteger(denominator);
    Math.abs(numerator).should.be.lte(Math.abs(denominator));
  });

  test('#compositeFractionList', () => {
    let result = generate.compositeFractionList(10);
    result.should.have.length(10);
    result.forEach(fraction => {
      fraction.should.match(/^-?\d+\/\d+$/);
      let [numerator, denominator] = fraction.split('/').map(num => parseInt(num));
      checkInteger(numerator);
      checkInteger(denominator);
      Math.abs(numerator).should.be.lte(Math.abs(denominator));
    });
  });
});

function checkInteger(integer) {
  integer.toString().should.match(/^-?\d+$/);
}

function checkComposite(composite) {
  generate.composites.should.include(composite);
}

function checkSuperComposite(superComposite) {
  generate.superComposites.should.include(superComposite);
}
