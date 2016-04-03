/* @flow */

let Home2 = require('./Home2');
let React = require('react');
let optimizely = require('../optimizely');
let preloadImage = require('../preloadImage');

class HomeContainer extends React.Component {
  constructor(props: Object) {
    super(props);
    this._tick = this._tick.bind(this);
    this._handleSelectScreenshot = this._handleSelectScreenshot.bind(this);
    this.state = {screenshot: 0};
  }

  componentDidMount(): void {
    this.interval = setInterval(this._tick, 6000);

    [
      'public/style/images/screenshot-2.png',
      'public/style/images/screenshot-3.png'
    ].forEach(preloadImage);

    optimizely.activate([
      // Splash button
      5357871655,
      // Benefits copy
      5384611902,
      // Only run one of primary/secondary splash experiment
      optimizely.oneOf([5370741565, 5384720737])
    ]);
  }

  componentWillUnmount(): void {
    clearInterval(this.interval);
  }

  render(): React.Element {
    setTimeout(this.props.onload, 0);
    return <Home2 screenshot={this.state.screenshot}
                  selectScreenshot={this._handleSelectScreenshot}
                  showModal={this.props.showModal}
                  displayModalError={this.props.displayModalError}
                  displayModalSuccess={this.props.displayModalSuccess}
                  clearMessages={this.props.clearMessages}
                  closeModal={this.props.closeModal} />;
  }

  _tick(): void {
    let {screenshot} = this.state;
    screenshot = (screenshot + 1) % 3;
    this.setState({screenshot});
  }

  _handleSelectScreenshot(screenshot: number): void {
    clearInterval(this.interval);
    this.setState({screenshot});
  }
}

module.exports = HomeContainer;
