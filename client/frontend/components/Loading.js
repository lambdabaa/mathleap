/* @flow */

let React = require('react');
let times = require('lodash/utility/times');

class Loading extends React.Component {
  constructor(props: Object) {
    super(props);
    this._tick = this._tick.bind(this);
    this.state = {stage: 0, interval: null};
  }

  componentDidMount() {
    this.interval = setInterval(this._tick, 500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  _tick() {
    let {stage} = this.state;
    stage = (stage + 1) % 9;
    this.setState({stage});
  }

  render(): React.Element {
    let {stage} = this.state;
    return <div id="loading-container">
      {
        times(8, (i: number): React.Element => {
          let className = `loading loading-${i}`;
          if (i < stage) {
            className += ' loading-active';
          }

          return <div className={className}></div>;
        })
      }
    </div>;
  }
}

module.exports = Loading;
