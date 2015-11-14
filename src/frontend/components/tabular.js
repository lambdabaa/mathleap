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
    let {cols, rows, selected} = this.props;
    return rows.map((row, rowIndex) => {
      let className = 'tabular-row';
      if (selected === rowIndex) {
        className += ' selected';
      }

      let height, tab;
      if (!Array.isArray(row)) {
        height = row.height;
        tab = row.tab;
        row = row.content;
      }

      let rowStyle = {};
      if (height) {
        rowStyle.height = height;
      }

      return <div key={rowIndex}
                  className={className}
                  style={rowStyle}>
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
        {
          tab &&
          <div className="tabular-row-tab"
               style={{backgroundColor: tab}}>
          </div>
        }
      </div>;
    });
  }
});
