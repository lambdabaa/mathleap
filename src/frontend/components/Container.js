let $ = document.querySelector.bind(document);
let React = require('react');
let defer = require('../../common/defer');

module.exports = React.createClass({
  displayName: 'Container',

  getInitialState: function() {
    return {modal: null, onceComponentUpdate: null};
  },

  componentWillMount: function() {
    let router = this.props.router;
    router.on('change', this._setRoute);
    this._setRoute();
  },

  render: function() {
    return <div id="outer-container">
      {
        this.state.modal &&
        <div className="overlay" onClick={this._handleOverlayClick}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-logo"></div>
              <div className="modal-exit" onClick={this._closeModal}>x</div>
            </div>
            <div className="modal-body">
              {this.state.modal}
            </div>
          </div>
        </div>
      }
      <div id="inner-container">{this.state.route.element}</div>
    </div>;
  },

  componentDidUpdate: function() {
    let fn = this.state.onceComponentUpdate;
    if (!fn) {
      return;
    }

    fn();
    this.setState({onceComponentUpdate: null});
  },

  _setRoute: function() {
    let router = this.props.router;
    // Make sure to scroll to the top of the embedded view once we load it.
    this.componentDidUpdate = () => {
      $('.topbar').scrollIntoView();
      delete this.componentDidUpdate;
    };

    this.setState({
      route: router.load({
        showModal: this._showModal,
        closeModal: this._closeModal
      })
    });
  },

  _showModal: function(modal) {
    let deferred = defer();
    this.setState({
      modal: modal,
      onceComponentUpdate: deferred.resolve
    });

    return deferred.promise;
  },

  _closeModal: function() {
    this.setState({modal: null});
  },

  _handleOverlayClick: function(event) {
    // Normally we'd be able to stopPropagation on children
    // but https://github.com/facebook/react/issues/1691 seems
    // to be an issue. Instead check whether target is overlay.
    if (!event.target.classList.contains('overlay')) {
      return;
    }

    this._closeModal();
  }
});
