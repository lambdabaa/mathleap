exports.once = function(target, eventType, listener, useCapture) {
  if (typeof listener !== 'function') {
    // promises style
    return new Promise(function(resolve) {
      nodeStyleOnce(target, eventType, resolve, useCapture);
    });
  }

  return nodeStyleOnce.apply(this, arguments);
};

function nodeStyleOnce(target, eventType, listener, useCapture) {
  exports.on(target, eventType, function callback() {
    exports.off(target, eventType, callback, useCapture);
    listener.apply(null, arguments);
  }, useCapture);
}

exports.on = function(target, eventType, listener, useCapture = false) {
  target.addEventListener(eventType, listener, useCapture);
};

exports.off = function(target, eventType, listener, useCapture = false) {
  target.removeEventListener(eventType, listener, useCapture);
};
