/* @flow */

let Edmodo = require('../edmodo');
let Firebase = require('firebase/lib/firebase-web');
let debug = require('../../common/debug')('store/users');
let {firebaseUrl} = require('../constants');
let request = require('./request');
let session = require('../session');
let students = require('./students');
let subscribe = require('./subscribe');
let teachers = require('./teachers');

import type {
  AccessToken,
  FBStudent,
  FBTeacher
} from '../../common/types';

type Credentials = {
  email: string;
  password: string;
};

let baseRef = new Firebase(firebaseUrl);
let studentsRef = baseRef.child('students');
let teachersRef = baseRef.child('teachers');

let subscription;

exports.create = async function(credentials: Credentials): Promise<string> {
  let user = await request(baseRef, 'createUser', credentials);
  debug('create user ok', JSON.stringify(user));
  return user.uid;
};

exports.login = async function(credentials: Credentials): Promise<void> {
  let auth = await request(baseRef, 'authWithPassword', credentials);
  session.set('auth', auth);

  let id = auth.uid;
  let ref = isStudent(credentials) ? studentsRef : teachersRef;
  let userRef = ref.child(id);
  subscription = subscribe(userRef, 'value');
  subscription.on('val', (user: FBTeacher | FBStudent): void => {
    if (user == null) {
      subscription.cancel();
      alert('User details missing from database. ' +
            'Please email support@mathleap.org or create a new account.');
      throw new Error(`User details for ${id} missing from database!`);
    }

    user.id = id;
    session.set('user', user);
  });
};

exports.edmodo = async function(auth: AccessToken): Promise<void> {
  let client = new Edmodo(auth);
  let user = await client.getUser();
  let result = await findOrCreateEdmodoUser(user);
  result.id = user.id;
  session.set('auth', auth);
  session.set('user', result);
};

exports.logout = function(): void {
  if (subscription) {
    subscription.cancel();
  }

  session.clear();
};

function isStudent(user: Object): boolean {
  return 'type' in user ?
    user.type === 'student' :                    // edmodo account
    user.email.endsWith('@mathleap.org');        // mathleap account
}

function findOrCreateEdmodoUser(user: Object): Promise<FBTeacher | FBStudent> {
  let fn = isStudent(user) ? findOrCreateEdmodoStudent : findOrCreateEdmodoTeacher;
  return fn(user);
}

async function findOrCreateEdmodoTeacher(user: Object): Promise<FBTeacher> {
  let teacher = await teachers.get(user.id);
  if (teacher) {
    return teacher;
  }

  /* eslint-disable camelcase */
  teachers.create(
    {
      email: user.email,
      title: user.title,
      first: user.first_name,
      last: user.last_name,
      misc: user
    },
    user.id
  );
  /* eslint-enable camelcase */

  return teachers.get(user.id);
}

async function findOrCreateEdmodoStudent(user: Object): Promise<FBStudent> {
  let student = await students.get(user.id);
  if (student) {
    return student;
  }

  /* eslint-disable camelcase */
  students.create(
    {
      username: user.username,
      first: user.first_name,
      last: user.last_name,
      misc: user
    },
    user.id
  );

  return students.get(user.id);
}
