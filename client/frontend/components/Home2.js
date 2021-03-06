/* @flow */

let $ = document.querySelector.bind(document);
let React = require('react');
let Topbar = require('./Topbar');
let debug = require('../../common/debug')('components/Home');
let {edmodoId, googleId} = require('../constants');
let handleEnter = require('../handleEnter');
let isBrowserSupported = require('../isBrowserSupported');
let querystring = require('querystring');
let students = require('../store/students');
let teachers = require('../store/teachers');
let users = require('../store/users');

function Home2(props: Object): React.Element {
  let actions = [
    <a key="common-core"
       className="topbar-action clickable-text"
       href="#!/common-core/"
       target="_blank">
      COMMON CORE
    </a>,
    <div key="demo"
         className="topbar-action clickable-text"
         onClick={handleVideoPlay.bind(this, props)}>
      DEMO
    </div>,
    <a key="community"
       className="topbar-action clickable-text"
       href="https://blog.mathleap.org/"
       target="_blank">
      COMMUNITY
    </a>,
    <div key="login"
         className="topbar-action clickable-text"
         onClick={handleLogin.bind(this, props)}>
      LOG IN
    </div>,
    <div key="signup"
         className="topbar-action signup-button"
         onClick={handleSignup.bind(this, props)}>
      SIGN UP
    </div>
  ];

  return <div id="home" className="home2">
    {
      isBrowserSupported() ?
        '' :
        <div className="service-outage">
          Browser not supported. Please use an
          up-to-date version of a desktop browser like
          <a href="https://www.google.com/chrome/">Google Chrome</a>.
        </div>
    }
    <div className="panel panel-2">
      <div className="home-container">
        <Topbar actions={actions} />
      </div>
      <div className="home-container">
        <div className="tagline">
          Algebra quizzes made <span className="emph">easy</span>!
        </div>
        <div className="subline">
          Create practice problems for students to solve online.
          <span className="emph">Free</span> for teachers.
        </div>
      </div>
      <div className="home-container">
        <div className="start-buttons">
          <div className="home-signup-button"
               onClick={handleSignup.bind(this, props)}>
            GET STARTED
          </div>
          <div className="emph button-separator">OR</div>
          <button className="login-edmodo-button" onClick={handleEdmodo}>
            <img id="edmodo-logo" src="public/style/images/edmodo-icon.png" />
            <div id="vertical-divider"></div>
            <p>Log in with <span id="edmodo">Edmodo</span></p>
          </button>
        </div>
      </div>
      <div className="home-container">
        <div className="how-it-works-container">
          <div className="how-it-works-steps">
            <div className="absimg dotted-circle dotted-circle-0"
                 style={props.screenshot !== 0 ? {opacity: '0.25'} : {}}></div>
            <div className="absimg dotted-line dotted-line-0"></div>
            <div className="absimg dotted-circle dotted-circle-1"
                 style={props.screenshot !== 1 ? {opacity: '0.25'} : {}}></div>
            <div className="absimg dotted-line dotted-line-1"></div>
            <div className="absimg dotted-circle dotted-circle-2"
                 style={props.screenshot !== 2 ? {opacity: '0.25'} : {}}></div>
            <div className="absimg how-it-works-icon how-it-works-generate"
                 style={props.screenshot !== 0 ? {opacity: '0.25'} : {}}
                 onClick={props.selectScreenshot.bind(props, 0)}></div>
            <div className="how-it-works-copy how-it-works-copy-0"
                 style={props.screenshot !== 0 ? {opacity: '0.25'} : {}}
                 onClick={props.selectScreenshot.bind(props, 0)}>
              <div className="how-it-works-copy-header">Generate assignments</div>
              <div className="how-it-works-copy-body">
                Create assignments by selecting question topics.
                We'll build you an assignment composed of algorithmically generated problems
                on the topics you choose.
              </div>
            </div>
            <div className="absimg how-it-works-icon how-it-works-solve"
                 style={props.screenshot !== 1 ? {opacity: '0.25'} : {}}
                 onClick={props.selectScreenshot.bind(props, 1)}></div>
            <div className="how-it-works-copy how-it-works-copy-1"
                 style={props.screenshot !== 1 ? {opacity: '0.25'} : {}}
                 onClick={props.selectScreenshot.bind(props, 1)}>
              <div className="how-it-works-copy-header">Solve problems online</div>
              <div className="how-it-works-copy-body">
                Students show their work using an online problem editor
                that helps them visualize their steps.
              </div>
            </div>
            <div className="absimg how-it-works-icon how-it-works-instant"
                 style={props.screenshot !== 2 ? {opacity: '0.25'} : {}}
                 onClick={props.selectScreenshot.bind(props, 2)}></div>
            <div className="how-it-works-copy how-it-works-copy-2"
                 style={props.screenshot !== 2 ? {opacity: '0.25'} : {}}
                 onClick={props.selectScreenshot.bind(props, 2)}>
              <div className="how-it-works-copy-header">Instant, line-by-line feedback</div>
              <div className="how-it-works-copy-body">
                Upon submission, our state of the art grading technology
                analyzes student responses for correctness and points out
                where they made mistakes.
              </div>
            </div>
          </div>
          <img className="how-it-works-image"
               src={`public/style/images/screenshot-${props.screenshot + 1}.png`} />
        </div>
      </div>
    </div>
    <div className="panel panel-1">
      <div className="home-container">
        <div className="proposition">
          <div className="proposition-icon practice-icon"></div>
          <div className="proposition-title">Student practice</div>
          <div className="proposition-description">
            MathLeap provides students with a fun new way to work through problems in the browser.
          </div>
        </div>
        <div className="proposition">
          <div className="proposition-icon feedback-icon"></div>
          <div className="proposition-title">Detailed feedback</div>
          <div className="proposition-description">
            With MathLeap, students learn from their mistakes with instant, line-by-line feedback.
          </div>
        </div>
        <div className="proposition">
          <div className="proposition-icon time-icon"></div>
          <div className="proposition-title">Time saved</div>
          <div className="proposition-description">
            Let our smart feedback engine do the grading! We'll help you and your students
            focus where it matters most.
          </div>
        </div>
      </div>
    </div>
    <div className="panel panel-4">
      <div className="home-container">
        <div className="testimonial-headshot">
          <div className="testimonial-shape testimonial-circle"></div>
          <div className="absimg testimonial-pic"></div>
          <div className="testimonial-shape testimonial-square"></div>
        </div>
        <div className="testimonial-quote">
          <div className="testimonial-quote-quote"></div>
          <div className="testimonial-quote-body">
            MathLeap helps me visualize my progress through a problem and
            shows me where I went wrong when I make a mistake.
          </div>
          <div className="testimonial-quote-attribution">
            <span className="emph">WILL LIFFERTH</span>, STUDENT
          </div>
        </div>
      </div>
    </div>
    <div className="panel panel-3">
      <div className="watch-the-video">SEE FOR YOURSELF</div>
      <div className="home-container">
        <video className="explainer"
               src="public/videos/demo.mp4"
               preload="auto"
               width="1050"
               controls>
        </video>
      </div>
    </div>
    <div className="panel panel-5">
      <div className="home-container">
        <div className="start-buttons">
          <div className="home-signup-button"
               onClick={handleSignup.bind(this, props)}>
            GET STARTED
          </div>
        </div>
        <img className="more-math" src="public/style/images/more_math.svg" />
      </div>
      <div className="water-top"></div>
      <div className="water">
        <div className="home-container">
          <div className="footer-logo"></div>
          <div className="legal-jargon">
            <div className="legal-top">© 2016 MathLeap, Inc.</div>
            <div className="legal-bottom">
              <div className="legal-link-column">
                <a className="legal-link" href="https://blog.mathleap.org" target="_blank">Blog</a>
                <a className="legal-link" href="#!/common-core/" target="_blank">Standards</a>
              </div>
              <div className="legal-link-column">
                <a className="legal-link" href="#!/press/" target="_blank">Press</a>
                <a className="legal-link" href="mailto:info@mathleap.org">Contact</a>
              </div>
              <div className="legal-link-column">
                <a className="legal-link" href="#!/tos/" target="_blank">Terms</a>
                <a className="legal-link" href="#!/privacy/" target="_blank">Privacy</a>
              </div>
            </div>
          </div>
          <div className="fish-and-wave"></div>
          <div className="social-media-container">
            <a href="https://facebook.com/mathleap" className="facebook-logo"></a>
            <a href="https://twitter.com/mathleapinc" className="twitter-logo"></a>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

function handleVideoPlay(props: Object): Promise {
  debug('play video');
  return props.showModal(
    <video className="demo"
           src="public/videos/demo.mp4"
           preload="auto"
           controls>
    </video>
  );
}

function handleSignup(props: Object): Promise {
  return props.showModal(
    <div className="choose-user-role">
      <div className="button"
           onClick={handleTeacher.bind(this, props)}>
        Teacher
      </div>
      <div className="button-inverse"
           onClick={handleStudent.bind(this, props)}>
        Student
      </div>
    </div>
  );
}

async function handleTeacher(props: Object): Promise<void> {
  debug('teacher');
  await props.showModal(
    <div className="teacher-form">
      {renderGoogleLogin()}
      <div className="alternate-signup">OR</div>
      <select className="teacher-title">
      <option>Mr.</option>
      <option>Mrs.</option>
      <option>Miss</option>
      <option>Ms.</option>
      <option>Dr.</option>
       <option>Prof</option>
      </select>
      <input type="text" className="teacher-first" placeholder="First name" />
      <input type="text" className="teacher-last" placeholder="Last name" />
      <input type="email" className="teacher-email" placeholder="Email" />
      <input type="password" className="teacher-password"
             placeholder="Password"
             onKeyDown={handleEnter(onTeacherSubmit.bind(this, props))} />
      <div className="teacher-submit button-inverse"
           onClick={onTeacherSubmit.bind(this, props)}>
        Sign up
      </div>
    </div>
  );

  $('.teacher-title').focus();
}

async function handleStudent(props: Object): Promise<void> {
  debug('student');
  await props.showModal(
    <div className="student-form">
      <input type="text" className="student-first" placeholder="First name" />
      <input type="text" className="student-last" placeholder="Last name" />
      <input type="text" className="student-username"
             placeholder="Username" />
      <input type="password" className="student-password" placeholder="Password"
             onKeyDown={handleEnter(onStudentSubmit.bind(this, props))} />
      <div className="student-submit button-inverse"
           onClick={onStudentSubmit.bind(this, props)}>
        Sign up
      </div>
    </div>
  );

  $('.student-first').focus();
}

async function handleLogin(props: Object): Promise<void> {
  debug('login');
  await props.showModal(
    <div className="login-form">
      {renderGoogleLogin()}
      <div className="alternate-signup">OR</div>
      <input type="text" className="login-email" placeholder="Email or username" />
      <input type="password" className="login-password" placeholder="Password"
             onKeyDown={handleEnter(onLoginSubmit.bind(this, props))} />
      <div className="login-submit button-inverse"
           onClick={onLoginSubmit.bind(this, props)}>
        Log in
      </div>
      <div className="clickable-text reset-password-link"
           onClick={handleResetPassword.bind(this, props)}>
        Forgot your password?
      </div>
    </div>
  );

  $('.login-email').focus();
}

async function handleResetPassword(props: Object): Promise<void> {
  debug('reset password');
  await props.showModal(
    <div className="reset-password-form">
      <input type="text" className="login-email" placeholder="Email" />
      <div className="login-submit button-inverse"
           onClick={onResetPasswordSubmit.bind(this, props)}>
        Reset password
      </div>
    </div>
  );

  $('.login-email').focus();
}

function handleGoogle() {
  /* eslint-disable camelcase */
  let urlparams = querystring.stringify({
    response_type: 'token',
    client_id: googleId,
    redirect_uri: `${location.protocol}//${location.host}`,
    scope: 'profile email',
    include_granted_scopes: true
  });
  /* eslint-enable camelcase */

  location.replace(`https://accounts.google.com/o/oauth2/v2/auth?${urlparams}`);
}

function handleEdmodo() {
  /* eslint-disable camelcase */
  let urlparams = querystring.stringify({
    client_id: edmodoId,
    redirect_uri: `${location.protocol}//${location.host}/`,
    scope: 'basic read_groups read_user_email',
    response_type: 'token'
  });
  /* eslint-enable camelcase */

  location.replace(`https://api.edmodo.com/oauth/authorize/?${urlparams}`);
}

async function onTeacherSubmit(props: Object): Promise<void> {
  debug('teacher submit');
  props.clearMessages();
  let {title, first, last, email, password} = getTeacherData();
  try {
    await teachers.create({title, first, last, email, password});
    await users.login({email, password});
  } catch (error) {
    return props.displayModalError(error.message);
  }

  props.closeModal();
}

async function onStudentSubmit(props: Object): Promise<void> {
  debug('student submit');
  props.clearMessages();
  let {first, last, username, password} = getStudentData();
  let email = `${username}@mathleap.org`;
  try {
    await students.create({email, first, last, username, password});
    await users.login({email, password});
  } catch (error) {
    return props.displayModalError(error.message);
  }

  props.closeModal();
}

async function onLoginSubmit(props: Object): Promise<void> {
  debug('login submit');
  let {uid, password} = getLoginData();
  let email = uid.includes('@') ? uid : `${uid}@mathleap.org`;
  try {
    await users.login({email, password});
  } catch (error) {
    return props.displayModalError(error.message);
  }

  props.closeModal();
}

async function onResetPasswordSubmit(props: Object): Promise<void> {
  debug('reset password submit');
  props.clearMessages();
  let {uid} = getLoginData();
  try {
    if (!uid || !uid.length) {
      throw new Error('Enter an email to reset your password.');
    }

    if (!uid.includes('@')) {
      throw new Error('Invalid email address.');
    }

    await users.resetPassword(uid);
  } catch (error) {
    return props.displayModalError(error.message);
  }

  props.displayModalSuccess('Check your email for a temporary password.');
}

function getTeacherData(): Object {
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let title = $('.teacher-title').value;
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let first = $('.teacher-first').value;
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let last = $('.teacher-last').value;
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let email = $('.teacher-email').value;
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let password = $('.teacher-password').value;
  return {title, first, last, email, password};
}

function getStudentData(): Object {
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let first = $('.student-first').value;
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let last = $('.student-last').value;
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let username = $('.student-username').value;
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let password = $('.student-password').value;
  return {first, last, username, password};
}

function getLoginData(): Object {
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let uid = $('.login-email').value;
  let passwordEl = $('.login-password');
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let password = passwordEl ? passwordEl.value : '';
  return {uid, password};
}

function renderGoogleLogin(): React.Element {
  return <div className="google-signin-button"
       onClick={handleGoogle}>
    <img src="public/style/images/google-signin-normal.png" />
    <span className="google-signin-button-divider">|</span>
    <span className="google-signin-button-text">Log in with Google</span>
  </div>;
}
module.exports = Home2;
