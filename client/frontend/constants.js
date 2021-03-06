/**
 * @fileoverview Application constants.
 */

// Edmodo
exports.edmodoId = location.host.indexOf('localhost') !== -1 ?
  '17a17cba9214b920977096045265ea187aa6b7de301e4e7401a1c765d97f6845' :
  'fc8a2c54370f1b7e96cec4568186af3a3ac6314880c98415e5083cd3a4ea6535';
exports.edmodoApiUrl = 'https://api.edmodo.com';

// Google
exports.googleApiKey = 'AIzaSyCPHAQjot1JfjWVnqd4hLhfcXYWsMkoYbw';
exports.googleId = '449088460494-vrjdlt400oo1jsf8d6pgkvg37njr1l6m.apps.googleusercontent.com';

// Firebase
exports.firebaseUrl = 'https://mathleap.firebaseio.com/v2';

// Heroku
exports.apiUrl = 'https://mathleap.herokuapp.com';
