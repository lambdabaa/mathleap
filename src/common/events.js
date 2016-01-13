/* @flow */
exports.once = function(target: Object, eventType: string,
                        listener: (event: Event) => void,
                        useCapture: boolean): void | Promise<Event> {
  if (typeof listener !== 'function') {
    // promises style
    return new Promise(function(resolve) {
      nodeStyleOnce(target, eventType, resolve, useCapture);
    });
  }

  return nodeStyleOnce.apply(this, arguments);
};

function nodeStyleOnce(target: Object, eventType: string,
                       listener: (event: Event) => void,
                       useCapture: boolean): void {
  exports.on(target, eventType, function callback() {
    exports.off(target, eventType, callback, useCapture);
    listener.apply(null, arguments);
  }, useCapture);
}

exports.on = function(target: Object, eventType: string,
                      listener: (event: Event) => void,
                      useCapture: boolean = false) {
  target.addEventListener(eventType, listener, useCapture);
};

exports.off = function(target: Object, eventType: string,
                       listener: (event: Event) => void,
                       useCapture: boolean = false): void {
  target.removeEventListener(eventType, listener, useCapture);
};
