/* @flow */

let Edmodo = require('../edmodo');
let classes = require('./classes');
let createSafeFirebaseRef = require('../createSafeFirebaseRef');
let debug = require('../../common/debug')('store/users');
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

let baseRef = createSafeFirebaseRef();
let studentsRef = baseRef.child('students');
let teachersRef = baseRef.child('teachers');

let client;
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
  client = new Edmodo(auth);
  let user = await client.getUser();
  debug('Got edmodo user', JSON.stringify(user));
  // Stringify edmodo user id.
  user.id = '' + user.id;
  let result = await findOrCreateEdmodoUser(user);
  if (!result) {
    debug('Failed to find or create edmodo user', JSON.stringify(user));
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

/* eslint-disable camelcase */
async function findOrCreateEdmodoTeacher(user: Object): Promise<FBTeacher> {
  let teacher = await teachers.get(user.id);
  if (teacher) {
    return teacher;
  }

  // $FlowFixMe: Flow doesn't know about Promise.all.
  let [groups] = await Promise.all([
    client.getGroups(),
    teachers.create(
      {
        email: user.email,
        title: user.title,
        first: user.first_name,
        last: user.last_name,
        misc: user
      },
      user.id
    )
  ]);

  // We also want to import the teacher's classes.
  await Promise.all(
    groups.map(async (group: Object) => {
      // $FlowFixMe: Flow doesn't know about Promise.all.
      let [aClass, members] = await Promise.all([
        classes.create({title: group.title, misc: group}, user.id),
        client.getGroupMemberships(group.id)
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
    throw new Error(`Failed to create edmodo teacher ${JSON.stringify(user)}`);
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
    throw new Error(`Failed to create edmodo student ${JSON.stringify(user)}`);
  }

  return result;
}
/* eslint-enable camelcase */