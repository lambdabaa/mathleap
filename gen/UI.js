/* @flow */

let LinkedStateMixin = require('react-addons-linked-state-mixin');
let React = require('react');
let listProblems = require('./listProblems');
let sleep = require('../client/common/sleep');

module.exports = React.createClass({
  mixins: [LinkedStateMixin],

  getInitialState: function(): Object {
    return {
      format: '',
      constraints: [''],
      results: []
    };
  },

  render: function(): React.Element {
    let {constraints, results} = this.state;
    return <div className="gen">
      <div className="config">
        <div className="config-format-label">Format</div>
        <input type="text"
               className="config-format"
               valueLink={this.linkState('format')} />
        <div className="config-constraints">
          <div className="config-constraints-label">Constraints</div>
          {
            constraints.map((constraint, index) => {
              let valueLink = {
                value: constraint,
                requestChange: this._handleConstraintChange.bind(this, index)
              };

              return <div className="config-constraint">
                <input type="text"
                       className="config-constraint-input"
                       valueLink={valueLink} />
                {
                  index === constraints.length - 1 &&
                  <img src="public/style/images/add_btn.png"
                       onClick={this._handleNewConstraint} />
                }
              </div>;
            })
          }
        </div>
        <button className="search-button"
                onClick={this._handleSearch}>
          Search
        </button>
      </div>
      <div className="results">
        {
          results.map(result => {
            return <div className="result">{formatResult(result)}</div>;
          })
        }
      </div>
    </div>;
  },

  _handleConstraintChange: function(index: number, newValue: string) {
    let {constraints} = this.state;
    constraints[index] = newValue;
    this.setState({constraints});
  },

  _handleNewConstraint: function() {
    let {constraints} = this.state;
    constraints.push('');
    this.setState({constraints});
  },

  _handleSearch: async function(): Promise {
    let {format, constraints} = this.state;
    constraints = constraints.filter(c => c.length > 0);
    let it = listProblems({format, constraints});
    let results = [];
    for (let result of it) {
      results.push(result);
      this.setState({results});
      await sleep(100);
    }
  }
});

function formatResult(result: Object): string {
  let parts = [result.stmt];
  for (let key in result.vars) {
    let value = result.vars[key];
    parts.push(`${key}=${value}`);
  }

  return parts.join(', ');
}
