(function() {
'use strict';

var obj = {};
if (!Object.setPrototypeOf && !obj.__proto__) {
  var getPrototypeOf = Object.getPrototypeOf;
  Object.getPrototypeOf = function(target) {
    return target.__proto__ || getPrototypeOf.call(Object, target);
  };
}

})();
