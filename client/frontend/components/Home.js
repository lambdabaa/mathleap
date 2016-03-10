/* @flow */

let $ = document.querySelector.bind(document);
let React = require('react');
let Topbar = require('./Topbar');
let bowser = require('bowser');
let debug = require('../../common/debug')('components/Home');
let {edmodoId} = require('../constants');
let handleEnter = require('../handleEnter');
let isBrowserSupported = require('../isBrowserSupported');
let querystring = require('querystring');
let students = require('../store/students');
let teachers = require('../store/teachers');
let users = require('../store/users');

module.exports = function(props: Object): React.Element {
  let actions = [
    <a key="community"
       className="topbar-action clickable-text"
       href="https://blog.mathleap.org/"
       target="_blank">
      COMMUNITY
    </a>,
    <a key="learn-more"
       className="topbar-action clickable-text"
       href="/public/learn-more.pdf"
       target="_blank">
      LEARN MORE
    </a>,
    <div key="demo"
         className="topbar-action clickable-text"
         onClick={handleVideoPlay.bind(this, props)}>
      DEMO
    </div>,
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

  return <div id="home">
    {
      isBrowserSupported() ?
        '' :
        <div className="service-outage">
          Browser not supported. Please use an
          up-to-date version of a desktop browser like
          <a href="https://www.google.com/chrome/">Google Chrome</a>.
        </div>
    }
    <div className="panel panel-0">
      {
        bowser.chrome || bowser.chromeos ?
          <a className="chrome-web-store"
             href="https://chrome.google.com/webstore/detail/mathleap/kdabnkopinpedfheiacocpbfabmbflfc"
             target="_blank">
            <img src="public/style/images/chrome-web-store.png" />
          </a> :
          ''
      }
      <div className="home-container">
        <Topbar actions={actions} />
      </div>
      <div className="sun">
        <div className="home-container">
          <div className="sun-ring outer-sun">
            <div className="sun-ring middle-sun">
              <div className="sun-ring inner-sun">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absimg cloud cloud-0"></div>
      <div className="absimg cloud cloud-1"></div>
      <div className="absimg cloud cloud-2"></div>
      <div className="absimg cloud cloud-3"></div>
      <div className="absimg cloud cloud-4"></div>
      <div className="home-container"
           style={{zIndex: 4}}>
        <div className="tagline">
          Math assignments made <span className="emph">easy</span>.
        </div>
        <div className="subline">
          Generated, self-grading math assignments for students to solve online.
          <span className="emph">Free</span> for teachers!
        </div>
        <div className="start-buttons">
          <div className="home-signup-button unselectable"
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
      <div className="island-features">
        <div className="home-container">
          <div className="absimg island-tree island-tree-left"></div>
          <div className="absimg island-tree island-tree-right"></div>
          <div className="absimg island-bush island-bush-left"></div>
          <div className="absimg island-bush island-bush-right"></div>
          <div className="absimg laptop"></div>
          <div className="absimg turtle-shadow"></div>
          <div className="absimg island-turtle"></div>
          <div className="absimg math-symbols"></div>
        </div>
      </div>
      <div className="island-hump">
        <div className="home-container">
        </div>
      </div>
      <div className="island">
        <div className="home-container">
          <div className="island-left"></div>
          <div className="island-center"></div>
          <div className="island-right"></div>
        </div>
      </div>
      <div className="water-top"></div>
      <div className="water">
        <div className="fish fish-0"></div>
        <div className="fish fish-1"></div>
        <div className="fish fish-2"></div>
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
          <div className="proposition-title">Personalized feedback</div>
          <div className="proposition-description">
            With MathLeap, students learn from their mistakes with instant, line-by-line feedback.
          </div>
        </div>
        <div className="proposition">
          <div className="proposition-icon time-icon"></div>
          <div className="proposition-title">Time well spent</div>
          <div className="proposition-description">
            Teaching is hard! We'll help you understand class performance
            so you can focus where it matters most.
          </div>
        </div>
      </div>
    </div>
    <div className="panel panel-2">
      <div className="home-container">
        <div className="how-it-works">HOW IT WORKS</div>
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
              <div className="how-it-works-copy-header">Students solve problems online</div>
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
    <div className="panel panel-3">
      <div className="watch-the-video">WATCH THE VIDEO</div>
      <div className="home-container">
        <video className="explainer"
               src="public/videos/demo.mp4"
               preload="auto"
               width="1050"
               controls>
        </video>
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
    <div className="panel panel-5">
      <div className="home-container">
        <div className="start-buttons">
          <div className="home-signup-button unselectable"
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
              <a className="legal-link" href="#!/common-core/">Common Core</a>
              <a className="legal-link" href="#!/tos/">Terms</a>
              <a className="legal-link" href="#!/privacy/">Privacy</a>
              <a className="legal-link" href="mailto:info@mathleap.org">Contact Us</a>
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
};

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
      <input type="text" className="login-email"
             placeholder="Email or username" />
      <input type="password" className="login-password" placeholder="Password"
             onKeyDown={handleEnter(onLoginSubmit.bind(this, props))} />
      <div className="login-submit button-inverse"
           onClick={onLoginSubmit.bind(this, props)}>
        Log in
      </div>
    </div>
  );

  $('.login-email').focus();
}

function handleEdmodo(): void {
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
  // $FlowFixMe: Flow complains that HTMLElement doesn't have value.
  let password = $('.login-password').value;
  return {uid, password};
}
