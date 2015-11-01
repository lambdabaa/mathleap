let listeners = {};

module.exports = function(ref, ...args) {
  let result = {};
  let methods = [];

  result.on = (method, fn) => {
    let key = hash(ref, method);
    if (!(key in listeners)) {
      listeners[key] = [];
    }

    listeners[key].push(fn);
    if (!methods.includes(method)) {
      methods.push(method);
    }
  };

  result.cancel = () => {
    ref.off(...args);
    methods.forEach(method => {
      let key = hash(ref, method);
      delete listeners[key];
    });
  };

  args.push(snapshot => {
    methods.forEach(method => {
      let data = snapshot[method]();
      let key = hash(ref, method);
      listeners[key].forEach(listener => listener(data));
    });
  });

  ref.on(...args);
  return result;
};

function hash(ref, method) {
  return `${ref.toString()}:${method}`;
}
