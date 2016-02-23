/* @flow */

let $ = document.querySelector.bind(document);
let App = require('./App');
let React = require('react');
let defer = require('../../common/defer');

class AppContainer extends React.Component {
  constructor(props: Object) {
    super(props);

    this._setRoute = this._setRoute.bind(this);
    this._showModal = this._showModal.bind(this);
    this._closeModal = this._closeModal.bind(this);
    this._handleOverlayClick = this._handleOverlayClick.bind(this);
    this._displayModalError = this._displayModalError.bind(this);

    this.state = {
      modal: null,
      errorMessage: null,
      onceComponentUpdate: null
    };
  }

  componentWillMount(): void {
    let router = this.props.router;
    router.on('change', this._setRoute);
    this._setRoute();
  }

  componentDidUpdate(): void {
    let fn = this.state.onceComponentUpdate;
    if (!fn) {
      return;
    }

    fn();
    this.setState({onceComponentUpdate: null});
  }

  render(): React.Element {
    return <App modal={this.state.modal}
                route={this.state.route}
                errorMessage={this.state.errorMessage}
                closeModal={this._closeModal}
                clickOverlay={this._handleOverlayClick} />;
  }

  _setRoute() {
    let router = this.props.router;
    // Make sure to scroll to the top of the embedded view once we load it.
    this.componentDidUpdate = () => {
      let topbar = $('.topbar');
      if (topbar) {
        topbar.scrollIntoView();
      }

      delete this.componentDidUpdate;
    };

    this.setState({
      route: router.load({
        showModal: this._showModal,
        closeModal: this._closeModal,
        clickOverlay: this._handleOverlayClick,
        displayModalError: this._displayModalError
      })
    });
  }

  _showModal(modal: React.Element) {
    let deferred = defer();
    this.setState({
      modal: modal,
      errorMessage: null,
      onceComponentUpdate: deferred.resolve
    });

    return deferred.promise;
  }

  _closeModal(): void {
    this.setState({modal: null});
  }

  _displayModalError(errorMessage: string): void {
    this.setState({errorMessage});
  }

  _handleOverlayClick(event: MouseEvent) {
    // Normally we'd be able to stopPropagation on children
    // but https://github.com/facebook/react/issues/1691 seems
    // to be an issue. Instead check whether target is overlay.
    // $FlowFixMe: Need to cast EventTarget to HTMLElement
    if (!event.target.classList.contains('overlay')) {
      return;
    }

    this._closeModal();
  }
}

module.exports = AppContainer;
