module.exports = fn => {
  return event => event.keyCode === 13 ? fn() : true;
};
