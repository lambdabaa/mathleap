/* @flow */

module.exports = function(magnitude: number): string {
  if (magnitude <= 0.25) {
    return 'red';
  }

  if (magnitude <= 0.5) {
    return 'orange';
  }

  if (magnitude <= 0.75) {
    return 'yellow';
  }

  return 'rgb(0, 255, 0)';
};
