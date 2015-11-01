let $ = document.querySelector.bind(document);
let React = require('react');
let Topbar = require('./topbar');
let debug = console.log.bind(console, '[components/home]');
let handleEnter = require('../handle_enter');
let students = require('../store/students');
let teachers = require('../store/teachers');
let users = require('../store/users');

module.exports = React.createClass({
  displayName: 'home',

  render: function() {
    let actions = [
      <div key="student"
           className="topbar-action clickable-text"
           onClick={this._handleStudent}>
        Student
      </div>,
      <div key="teacher"
           className="topbar-action clickable-text"
           onClick={this._handleTeacher}>
        Teacher
      </div>,
      <div key="login"
           className="topbar-action clickable-text"
           onClick={this._handleLogin}>
        Log in
      </div>
    ];

    return <div id="home">
      <Topbar actions={actions} />
      <div className="jumbotron">
      </div>
    </div>;
  },

  _handleTeacher: async function() {
    debug('teacher');
    await this.props.showModal(
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
        <input type="password" className="teacher-password" placeholder="Password"
               onKeyDown={handleEnter(this._onSignupTeacherSubmit)} />
        <div className="teacher-submit button-inverse"
             onClick={this._onTeacherSubmit}>
          Sign up
        </div>
      </div>
    );

    $('.teacher-title').focus();
  },

  _handleStudent: async function() {
    debug('student');
    await this.props.showModal(
      <div className="student-form">
        <input type="text" className="student-first" placeholder="First name" />
        <input type="text" className="student-last" placeholder="Last name" />
        <input type="text" className="student-username" placeholder="Username" />
        <input type="text" className="student-password" placeholder="Password"
               onKeyDown={handleEnter(this._onSignupStudentSubmit)} />
        <div className="student-submit button-inverse"
             onClick={this._onStudentSubmit}>
          Sign up
        </div>
      </div>
    );

    $('.student-first').focus();
  },

  _handleLogin: async function() {
    debug('login');
    await this.props.showModal(
      <div className="login-form">
        <input type="text" className="login-email" placeholder="Email or username" />
        <input type="password" className="login-password" placeholder="Password"
               onKeyDown={handleEnter(this._onLoginSubmit)} />
        <div className="login-submit button-inverse"
             onClick={this._onLoginSubmit}>
          Log in
        </div>
      </div>
    );

    $('.login-email').focus();
  },

  _onTeacherSubmit: async function() {
    debug('teacher submit');
    let title = $('.teacher-title').value;
    let first = $('.teacher-first').value;
    let last = $('.teacher-last').value;
    let email = $('.teacher-email').value;
    let password = $('.teacher-password').value;
    await teachers.create({title, first, last, email, password});
    await users.login({email, password});
    this.props.closeModal();
  },

  _onStudentSubmit: async function() {
    debug('student submit');
    let first = $('.student-first').value;
    let last = $('.student-last').value;
    let username = $('.student-username').value;
    let password = $('.student-password').value;
    let email = `${username}@mathleap.org`;
    await students.create({email, first, last, username, password});
    await users.login({email, password});
    this.props.closeModal();
  },

  _onLoginSubmit: async function() {
    debug('login submit');
    let uid = $('.login-email').value;
    let password = $('.login-password').value;
    let email = uid.includes('@') ? uid : `${uid}@mathleap.org`;
    await users.login({email, password});
    this.props.closeModal();
  }
});
