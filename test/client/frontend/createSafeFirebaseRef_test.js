let createSafeFirebaseRef = require('../../../client/frontend/createSafeFirebaseRef');

suite('createSafeFirebaseRef', () => {
  test('basic', () => {
    createSafeFirebaseRef('/lolcats/zmKT!+91/')
    .toString()
    .should
    .equal('https://mathleap.firebaseio.com/v2/lolcats/zmKT!%2B91');
  });

  test('no leading /', () => {
    createSafeFirebaseRef('lolcats/zmKT!+91/')
    .toString()
    .should
    .equal('https://mathleap.firebaseio.com/v2/lolcats/zmKT!%2B91');
  });

  test('#child', () => {
    createSafeFirebaseRef('lol').child('zmKT!+91/cats/')
    .toString()
    .should
    .equal('https://mathleap.firebaseio.com/v2/lol/zmKT!%2B91/cats');
  });
});
