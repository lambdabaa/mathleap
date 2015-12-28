let defer = require('../../common/defer');
let session = require('../session');

module.exports = async function(ref, method, ...args) {
  let auth = session.get('auth');
  if (auth) {
    try {
      await request(ref, 'auth', auth.token);
    } catch (error) {
      return console.error(error.toString());
    }
  }

  return request(ref, method, ...args);
};

function request(ref, method, ...args) {
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
}
