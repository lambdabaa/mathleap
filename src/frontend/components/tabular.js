let React = require('react');

module.exports = React.createClass({
  displayName: 'tabular',

  render: function() {
    let className = `tabular ${this.props.className || ''}`;
    return <div className={className}>
      <div className="tabular-headers">{this._getHeaders()}</div>
      <div className="tabular-rows">{this._getRows()}</div>
    </div>;
  },

  _getHeaders: function() {
    let {cols} = this.props;
    return cols.map((col, index) => {
      let style = {};

      // width
      style.width = typeof col === 'object' && col.width ?
        col.width :
        `${100 * (1 / cols.length)}%`;

      // text-align
      if (col.align === 'right') {
        style.textAlign = 'right';
      }

      return <div key={index}
                  className="tabular-header"
                  style={style}>
        {
          typeof col === 'object' ? col.content : col
        }
      </div>;
    });
  },

  _getRows: function() {
    let {cols, rows} = this.props;
    return rows.map((row, rowIndex) => {
      return <div key={rowIndex} className="tabular-row">
        {
          row.map((cell, cellIndex) => {
            let style = {};

            // width
            let col = cols[cellIndex];
            style.width = typeof col === 'object' && col.width ?
              `${cols[cellIndex].width}px` :
              `${100 * (1 / cols.length)}%`;

            // text-align
            if (col.align === 'right') {
              style.textAlign = 'right';
            }

            return <div key={cellIndex}
                        className="tabular-cell"
                        style={style}>
              {cell}
            </div>;
          })
        }
      </div>;
    });
  }
});
