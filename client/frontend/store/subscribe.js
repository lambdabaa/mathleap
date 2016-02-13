/* @flow */

let listeners = {};

type Subscription = {on: Function, cancel: Function};

module.exports = function(ref: Object, ...args: any): Subscription {
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
    methods.forEach((method: string): void => {
      let key = hash(ref, method);
      delete listeners[key];
    });
  };

  args.push(snapshot => {
    methods.forEach((method: string): void => {
      let data = snapshot[method]();
      let key = hash(ref, method);
      listeners[key].forEach((listener: Function): void => {
        listener(data);
      });
    });
  });

  ref.on(...args);
  return result;
};

function hash(ref: Object, method: string): string {
  return `${ref.toString()}:${method}`;
}
