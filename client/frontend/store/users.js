/* @flow */

let Edmodo = require('../edmodo');
let Firebase = require('firebase/lib/firebase-web');
let Google = require('../google');
let classes = require('./classes');
let createSafeFirebaseRef = require('../createSafeFirebaseRef');
let debug = require('../../common/debug')('store/users');
let request = require('./request');
let session = require('../session');
let stringify = require('../../common/stringify');
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

let root = new Firebase('https://mathleap.firebaseio.com');
let baseRef = createSafeFirebaseRef();
let studentsRef = baseRef.child('students');
let teachersRef = baseRef.child('teachers');

let edmodo;
let google;
let subscription;

exports.create = async function(credentials: Credentials): Promise<string> {
  let user = await request(baseRef, 'createUser', credentials);
  debug('create user ok', stringify(user));
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
  edmodo = new Edmodo(auth);
  let user = await edmodo.getUser();
  debug('Got edmodo user', stringify(user));
  // Stringify edmodo user id.
  user.id = '' + user.id;
  let result = await findOrCreateEdmodoUser(user);
  if (!result) {
    debug('Failed to find or create edmodo user', stringify(user));
    location.hash = '#!/home/';
    return;
  }

  result.id = user.id;
  session.set('auth', auth);
  session.set('user', result);
};

exports.google = async function(auth: AccessToken): Promise<void> {
  google = new Google(auth);
  let user = await google.getUser();
  debug('Got google user', stringify(user));
  user.id = `google-${user.id}`;
  let result = await findOrCreateGoogleUser(user);
  if (!result) {
    debug('Failed to find or create google user', stringify(user));
    location.hash = '#!/home/';
    return;
  }

  result.id = user.id;
  session.set('auth', auth);
  session.set('user', result);
};

exports.logout = function(): void {
  if (subscription) {
    subscription.cancel();
  }

  session.clear();
  session.emit('user', null);  // Just in case
};

exports.resetPassword = function(email: string): Promise<void> {
  return request(root, 'resetPassword', {email});
};

exports.changePassword = function(data: Object): Promise<void> {
  debug('change password', JSON.stringify(data));
  return request(root, 'changePassword', data);
};

function isStudent(user: Object): boolean {
  return 'type' in user ?
    user.type === 'student' :                    // edmodo account
    user.email.endsWith('@mathleap.org');        // mathleap account
}

function findOrCreateEdmodoUser(user: Object): Promise<?FBTeacher | ?FBStudent> {
  let fn = isStudent(user) ? findOrCreateEdmodoStudent : findOrCreateEdmodoTeacher;
  return fn(user);
}

async function findOrCreateGoogleUser(user: Object): Promise<?FBTeacher | ?FBStudent> {
  let teacher = await teachers.get(user.id);
  if (teacher) {
    return teacher;
  }

  await teachers.create(
    {
      email: user.emails[0].value,
      first: user.name.givenName,
      last: user.name.familyName,
      misc: user
    },
    user.id
  );

  return await teachers.get(user.id);
}

/* eslint-disable camelcase */
async function findOrCreateEdmodoTeacher(user: Object): Promise<FBTeacher> {
  let teacher = await teachers.get(user.id);
  if (teacher) {
    return teacher;
  }

  await teachers.create(
    {
      email: user.email,
      title: user.title,
      first: user.first_name,
      last: user.last_name,
      misc: user
    },
    user.id
  );

  let groups = await edmodo.getGroups();

  // We also want to import the teacher's classes.
  await Promise.all(
    groups.map(async (group: Object) => {
      // $FlowFixMe: Flow doesn't know about Promise.all.
      let [aClass, members] = await Promise.all([
        classes.create({title: group.title, misc: group}, user.id),
        edmodo.getGroupMemberships(group.id)
      ]);

      await Promise.all(
        members.map(async (member: Object): Promise => {
          if (member.user.type !== 'student') {
            return;
          }

          let student = await findOrCreateEdmodoStudent(member.user);
          await classes.join(aClass.code, student.id);
        })
      );
    })
  );

  let result = await teachers.get(user.id);
  if (!result) {
    throw new Error(`Failed to create edmodo teacher ${stringify(user)}`);
  }

  return result;
}

async function findOrCreateEdmodoStudent(user: Object): Promise<FBStudent> {
  let student = await students.get(user.id);
  if (student) {
    return student;
  }

  await students.create(
    {
      username: user.username,
      first: user.first_name,
      last: user.last_name,
      misc: user,
      email: `${user.username}+edmodo@mathleap.org`
    },
    user.id
  );

  let result = await students.get(user.id);
  if (!result) {
    throw new Error(`Failed to create edmodo student ${stringify(user)}`);
  }

  return result;
}
/* eslint-enable camelcase */
