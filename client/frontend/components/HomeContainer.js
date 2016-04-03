/* @flow */

let Home = require('./Home');
let React = require('react');
let preloadImage = require('../preloadImage');

class HomeContainer extends React.Component {
  constructor(props: Object) {
    super(props);
    this._tick = this._tick.bind(this);
    this._handleSelectScreenshot = this._handleSelectScreenshot.bind(this);
    this.state = {screenshot: 0};
  }

  componentDidMount(): void {
    let clouds = Array.from(document.getElementsByClassName('cloud'));
    clouds.forEach((cloud: HTMLElement): void => {
      // All of the clouds start out in different positions
      // and since we want them to travel at the same pace
      // we need to set their transition times based on their
      // initial positions.
      setTransition(
        cloud,
        (document.body.clientWidth - +window.getComputedStyle(cloud).left.slice(0, -2)) /
        document.body.clientWidth
      );
    });

    let fish = Array.from(document.getElementsByClassName('fish'));
    fish.forEach((aFish: HTMLElement): void => {
      // All of the fish start out in different positions
      // and since we want them to travel at the same pace
      // we need to set their transition times based on their
      // initial positions.
      setTransition(
        aFish,
        -window.getComputedStyle(aFish).left.slice(0, -2) /
        document.body.clientWidth
      );
    });

    this.interval = setInterval(this._tick, 6000);

    [
      'public/style/images/screenshot-2.png',
      'public/style/images/screenshot-3.png'
    ].forEach(preloadImage);
  }

  componentWillUnmount(): void {
    clearInterval(this.interval);
  }

  render(): React.Element {
    setTimeout(this.props.onload, 0);
    return <Home screenshot={this.state.screenshot}
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

function setTransition(element: HTMLElement, percent: number | string): void {
  let elementWidth = +window.getComputedStyle(element).width.slice(0, -2);
  let bodyWidth = document.body.clientWidth;
  let translation;
  if (typeof percent === 'number') {
  translation = percent * bodyWidth;
    if (percent > 0) {
      translation += elementWidth;
    } else {
      translation -= elementWidth;
    }
  }

  [
    'mozTransition',
    'webkitTransition',
    'transition'
  ].forEach((transition: string): void => {
    // $FlowFixMe: CSSStyleDeclaration
    element.style[transition] = typeof percent !== 'number' ?
      percent :
      `${60 * Math.abs(percent)}s linear`;
  });

  [
    'mozTransform',
    'msTransform',
    'webkitTransform',
    'transform'
  ].forEach((transform: string): void => {
    // $FlowFixMe: CSSStyleDeclaration
    element.style[transform] = typeof percent === 'number' ?
      `translateX(${translation}px)` :
      'translateX(0)';
  });
}

module.exports = HomeContainer;
