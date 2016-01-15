/* @flow */

let defer = require('../../common/defer');

/**
module.exports = async function(ref, method, ...args) {
  let auth = session.get('auth');
  if (auth && typeof ref.authWithCustomToken === 'function') {
    try {
      await request(ref, 'authWithCustomToken', auth.token);
    } catch (error) {
      return debug('authentication error', error);
    }
  }

  return request(ref, method, ...args);
};
*/

module.exports = function request(ref: Object, method: string, ...args: any): Promise {
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
