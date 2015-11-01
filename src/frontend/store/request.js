let defer = require('../../common/defer');

module.exports = function(ref, method, ...args) {
  let deferred = defer();
  switch (method) {
    case 'once':
      args.push(snapshot => deferred.resolve(snapshot.val()));
      args.push(deferred.reject);
      break;
    default:
      args.push((error, value) => {
        if (error) {
          deferred.reject(error);
        } else {
          deferred.resolve(value);
        }
      });
      break;
  }

  ref[method](...args);
  return deferred.promise;
};
