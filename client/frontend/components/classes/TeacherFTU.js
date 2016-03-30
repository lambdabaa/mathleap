/* @flow */

let $ = document.querySelector.bind(document);
let React = require('react');
let format = require('../../helpers/format');
let {once} = require('../../../common/events');
let waitFor = require('../../../common/waitFor');
let teachers = require('../../store/teachers');

class TeacherFTU extends React.Component {
  constructor(props: Object) {
    super(props);
    this._handleComplete = this._handleComplete.bind(this);
    this._continue = this._continue.bind(this);
    this.state = {complete: false};
  }

  async componentDidMount(): Promise {
    let video: HTMLElement;
    await waitFor(() => {
      video = $('.ftu-video');
      return !!video;
    });

    // $FlowFixMe
    once(video, 'pause', this._handleComplete);
    // $FlowFixMe
    once(video, 'played', this._handleComplete);
  }

  render(): React.Element {
    let {user} = this.props;
    let {complete} = this.state;
    return <div id="teacher-ftu">
      <div className="view">
        <div className="ftu-header">
          {`Welcome to MathLeap, ${format.teacher(user)}!`}
        </div>
        <div className="ftu-subheader">
          Take a two-minute video tour of what makes MathLeap great for students.
        </div>
        <video className="ftu-video"
               src="public/videos/teacher-ftu.mp4"
               preload="auto"
               controls>
        </video>
        {
          complete ?
            <div className="continue-button"
                 onClick={this._continue}>
              Continue
            </div> :
            <div className="clickable-text"
                 onClick={this._continue}>
              No thanks, I'll skip this
            </div>
        }
      </div>
    </div>;
  }

  _handleComplete() {
    this.setState({complete: true});
  }

  _continue() {
    teachers.clearFTU(this.props.user);
  }
}

module.exports = TeacherFTU;
