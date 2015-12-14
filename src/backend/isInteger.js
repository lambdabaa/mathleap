module.exports = function(num) {
  if (typeof num !== 'number') {
    return false;
  }

  return /^-?\d+\.?0*$/.test(num.toString());
};
