let Firebase = require('firebase/lib/firebase-web');
let debug = console.log.bind(console, '[store/students]');
let request = require('./request');
let users = require('./users');

let studentsRef = new Firebase('https://mathleap.firebaseio.com/students');

exports.create = async function(options) {
  let student = {
    email: options.email,
    first: options.first,
    last: options.last,
    username: options.username,
    role: 'student'
  };

  student.uid = await users.create({
    email: options.email,
    password: options.password
  });

  let ref = studentsRef.child(btoa(student.email));
  await request(ref, 'set', student);
  debug('create student ok', JSON.stringify(student));
};

exports.get = async function get(id) {
  debug('get student', id);
  let ref = studentsRef.child(id);
  let student = await request(ref, 'once', 'value');
  student.id = id;
  debug('get student ok', JSON.stringify(student));
  return student;
};
