/* @flow */

let React = require('react');
let Tutorial = require('./Tutorial');

class TutorialContainer extends React.Component {
  constructor(props: Object) {
    super(props);
    this.state = {carousel: 0};
    this._setCarousel = this._setCarousel.bind(this);
    this._tick = this._tick.bind(this);
  }

  componentDidMount(): void {
    this.interval = setInterval(this._tick, 10000);
  }

  componentWillUnmount(): void {
    clearInterval(this.interval);
  }

  render(): React.Element {
    return <Tutorial carousel={this.state.carousel}
                     setCarousel={this._setCarousel}
                     dismiss={this.props.dismiss} />;
  }

  _setCarousel(index: number): void {
    clearInterval(this.interval);
    this.setState({carousel: index});
    this.interval = setInterval(this._tick, 6000);
  }

  _tick(): void {
    let {carousel} = this.state;
    carousel = (carousel + 1) % 7;
    this.setState({carousel});
  }
}

module.exports = TutorialContainer;
