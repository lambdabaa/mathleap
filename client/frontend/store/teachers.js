/* @flow */

let createSafeFirebaseRef = require('../createSafeFirebaseRef');
let debug = require('../../common/debug')('store/teachers');
let request = require('./request');
let ses = require('../ses');
let session = require('../session');
let stringify = require('../../common/stringify');
let users = require('./users');

import type {FBTeacher} from '../../common/types';

let teachersRef = createSafeFirebaseRef('teachers');

exports.create = async function(options: Object, uid: ?string): Promise<void> {
  let teacher = {
    email: options.email || 'unknown-teacher@mathleap.org',
    title: options.title || 'Prof',
    first: options.first || '',
    last: options.last || '',
    role: 'teacher',
    misc: options.misc || {},
    ftu: true,
    scratchpadFtu: true
  };

  if (uid == null) {
    uid = await users.create({email: options.email, password: options.password});
  }

  let ref = teachersRef.child(uid);
  await request(ref, 'set', teacher);
  debug('create teacher ok', stringify(teacher));
  ses.sendEmail(
    options.email,
    '∮ Welcome to MathLeap',
    `<p>Hi ${teacher.first},</p>
<p>
I noticed you signed up for MathLeap -- welcome to the community! I'm Gareth, a mathematician
and the creator of the site. You can reach me personally at gareth@mathleap.org with any requests
or questions. If you're wondering how you can leverage MathLeap in your classes, I
encourage you to watch our short
<a href="https://mathleap.org/public/videos/demo.mp4">demo video</a>.
</p>
<p>
We're adding new features and content every week, and if you
<a href="https://twitter.com/mathleapinc">follow us on Twitter</a>
or
<a href="https://facebook.com/mathleap">like us on Facebook</a>
you'll be the first to hear about it.
</p>
<p>
Excited to have you join the site. Enjoy MathLeap!
</p>
<p>
-Gareth
</p>
`,
`Hi ${teacher.first},

I noticed you signed up for MathLeap -- welcome to the community! I'm Gareth, a mathematician
and the creator of the site. You can reach me personally at gareth@mathleap.org with any requests
or questions. If you're wondering how you can leverage MathLeap in your classes, I
encourage you to watch our short demo video at https://mathleap.org/public/videos/demo.mp4.

We're adding new features and content every week, and if you follow us on
Twitter (https://twitter.com/mathleapinc/) or like us on Facebook (https://facebook.com/mathleap/)
you'll be the first to hear about it.

Excited to have you join the site. Enjoy MathLeap!

-Gareth
`
  );
};

exports.get = async function(id: string): Promise<?FBTeacher> {
  debug('get teacher', id);
  let ref = teachersRef.child(id);
  let teacher = await request(ref, 'once', 'value');
  if (!teacher) {
    return null;
  }

  teacher.id = id;
  debug('get teacher ok', stringify(teacher));
  return teacher;
};

exports.clearFTU = async function(teacher: FBTeacher): Promise {
  let ref = teachersRef.child(teacher.id);
  let ftu = ref.child('ftu');
  await request(ftu, 'set', false);
  // TODO: This is not ideal...
  let user = await exports.get(teacher.id);
  session.set('user', user);
};

exports.clearScratchpadFtu = async function(teacher: FBTeacher): Promise {
  let ref = teachersRef.child(teacher.id);
  let ftu = ref.child('scratchpadFtu');
  await request(ftu, 'set', false);
  // TODO: This is not ideal...
  let user = await exports.get(teacher.id);
  session.set('user', user);
};
