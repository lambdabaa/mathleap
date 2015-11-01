let Firebase = require('firebase/lib/firebase-web');
let debug = console.log.bind(console, '[store/teachers]');
let request = require('./request');
let users = require('./users');

let teachersRef = new Firebase('https://mathleap.firebaseio.com/teachers');

exports.create = async function(options) {
  let teacher = {
    email: options.email,
    title: options.title,
    first: options.first,
    last: options.last,
    role: 'teacher'
  };

  teacher.uid = await users.create({
    email: options.email,
    password: options.password
  });

  let ref = teachersRef.child(btoa(teacher.email));
  await request(ref, 'set', teacher);
  debug('create teacher ok', JSON.stringify(teacher));
};
