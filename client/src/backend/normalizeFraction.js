/* @flow */

module.exports = function(numerator: number, denominator: number): string {
  let negative = numerator >= 0 !== denominator > 0;
  numerator = Math.abs(numerator);
  denominator = Math.abs(denominator);
  return `${negative ? '-' : ''}${numerator}/${denominator}`;
};
