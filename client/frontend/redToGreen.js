/* @flow */

module.exports = function(magnitude: number): string {
  if (magnitude <= 0.60) {
    return 'red';
  }

  if (magnitude <= 0.75) {
    return 'orange';
  }

  if (magnitude <= 0.85) {
    return 'yellow';
  }

  return 'rgb(0, 255, 0)';
};
