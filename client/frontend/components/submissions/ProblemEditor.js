/* @flow */

let React = require('react');
let EditContainer = require('./EditContainer');
let FTUContainer = require('./FTUContainer');
let helper = require('../../helpers/user');
let session = require('../../session');

class ProblemEditor extends React.Component {
  constructor(props: Object) {
    super(props);
    this.state = {user: session.get('user')};
  }

  componentDidMount() {
    session.on('user', user => this.setState({user}));
  }

  render(): React.Element {
    let {user} = this.state;
    return helper.isScratchpadFtu(user) ?
      React.createElement(FTUContainer, this.props) :
      React.createElement(EditContainer, this.props);
  }
}

module.exports = ProblemEditor;
