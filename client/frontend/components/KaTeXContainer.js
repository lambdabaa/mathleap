/* @flow */

let KaTeX = require('./KaTeX');
let React = require('react');
let bridge = require('../bridge');
let debug = require('../../common/debug')('KaTeXContainer');
let {mapChar} = require('../../common/string');

class KaTeXContainer extends React.Component {
  constructor(props: Object) {
    super(props);
    this.state = {error: false, tex: null};
  }

  componentWillMount(): void {
    this._handleProps(this.props);
  }

  componentWillReceiveProps(props: Object): void {
    this._handleProps(props);
  }

  async _handleProps(props: Object): Promise<void> {
    let tex;
    try {
      tex = await bridge('texify', '' + props.ascii);
    } catch (error) {
      debug(error);
      return this.setState({error: true});
    }

    this.setState({tex, error: false});
  }

  render(): React.Element {
    let {error, tex} = this.state;
    let props = Object.assign({}, this.props, {tex});
    if (error) {
      return React.createElement(
        'div',
        props,
        mapChar(this.props.ascii, (chr: string, index: number): React.Element => {
          return <span key={index} style={{paddingLeft: '2px'}}>{chr}</span>;
        })
      );
    }

    return React.createElement(KaTeX, props);
  }
}

module.exports = KaTeXContainer;
