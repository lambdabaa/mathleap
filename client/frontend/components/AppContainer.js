/* @flow */

let $ = document.querySelector.bind(document);
let App = require('./App');
let React = require('react');
let debug = require('../../common/debug')('AppContainer');
let defer = require('../../common/defer');

class AppContainer extends React.Component {
  constructor(props: Object) {
    super(props);

    this._setRoute = this._setRoute.bind(this);
    this._showModal = this._showModal.bind(this);
    this._closeModal = this._closeModal.bind(this);
    this._handleOverlayClick = this._handleOverlayClick.bind(this);
    this._displayModalError = this._displayModalError.bind(this);
    this._displayModalSuccess = this._displayModalSuccess.bind(this);
    this._clearMessages = this._clearMessages.bind(this);

    this.state = {
      isLoading: false,
      modal: null,
      errorMessage: null,
      successMessage: null,
      onceComponentUpdate: null
    };
  }

  componentWillMount(): void {
    let {router} = this.props;
    router.on('change', this._setRoute);
    this._setRoute();
  }

  componentDidUpdate(): void {
    let {onceComponentUpdate} = this.state;
    if (!onceComponentUpdate) {
      return;
    }

    onceComponentUpdate();
    this.setState({onceComponentUpdate: null});
  }

  render(): React.Element {
    return <App modal={this.state.modal}
                route={this.state.route}
                isLoading={this.state.isLoading}
                errorMessage={this.state.errorMessage}
                successMessage={this.state.successMessage}
                closeModal={this._closeModal}
                clearMessages={this._clearMessages}
                clickOverlay={this._handleOverlayClick} />;
  }

  _setRoute(): void {
    this.setState({isLoading: true});
    let {router} = this.props;
    // Make sure to scroll to the top of the embedded view once we load it.
    this.componentDidUpdate = () => {
      let topbar = $('.topbar');
      if (topbar) {
        topbar.scrollIntoView();
      }

      delete this.componentDidUpdate;
    };

    let route = router.load({
      showModal: this._showModal,
      closeModal: this._closeModal,
      clickOverlay: this._handleOverlayClick,
      displayModalError: this._displayModalError,
      displayModalSuccess: this._displayModalSuccess,
      clearMessages: this._clearMessages,
      onpending: () => {
        if (this.state.isLoading) {
          return;
        }

        debug('pending');
        this.setState({isLoading: true});
      },
      onload: () => {
        if (!this.state.isLoading) {
          return;
        }

        debug('load');
        this.setState({isLoading: false});
      }
    });

    this.setState({route});
  }

  _showModal(modal: React.Element): Promise<void> {
    let deferred = defer();
    this.setState({
      modal: modal,
      errorMessage: null,
      successMessage: null,
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

  _displayModalSuccess(successMessage: string): void {
    this.setState({successMessage});
  }

  _clearMessages(): void {
    this.setState({successMessage: null, errorMessage: null});
  }

  _handleOverlayClick(event: MouseEvent): void {
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
