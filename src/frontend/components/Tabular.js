let React = require('react');

module.exports = React.createClass({
  displayName: 'Tabular',

  render: function() {
    return <div className={`tabular ${this.props.className || ''}`}>
      <div className="tabular-headers">{this._getHeaders()}</div>
      <div className="tabular-rows">{this._getRows()}</div>
    </div>;
  },

  _getHeaders: function() {
    let {cols} = this.props;
    return cols.map((col, index) => {
      let style = {width: `${100 / cols.length}%`};
      if (typeof col === 'object') {
        // width
        style.width = col.width && `${col.width}px` || style.width;
        style.textAlign = col.align || 'left';
      }

      return <div key={index} className="tabular-header" style={style}>
        {
          typeof col === 'object' ? col.content : col
        }
      </div>;
    });
  },

  _getRows: function() {
    let {cols, rows, selected} = this.props;
    return rows.map((row, rowIndex) => getRow(row, rowIndex, cols, selected));
  }
});

function getRow(row, rowIndex, cols, selected) {
  let className = `tabular-row ${selected === rowIndex && 'selected'}`;
  let {height, tab} = row;
  row = Array.isArray(row) ? row : row.content;
  let rowStyle = height ? {height} : {};

  return <div key={rowIndex} className={className} style={rowStyle}>
    {
      row.map((cell, cellIndex) => getCell(cell, cellIndex, cols))
    }
    {
      tab &&
      <div className="tabular-row-tab" style={{backgroundColor: tab}}></div>
    }
  </div>;
}

function getCell(cell, cellIndex, cols) {
  let style = {width: `${100 / cols.length}%`};
  let col = cols[cellIndex];
  if (typeof col === 'object') {
    style.width = col.width && `${col.width}px` || style.width;
    style.textAlign = col.align || 'left';
  }

  return <div key={cellIndex} className="tabular-cell" style={style}>
    {cell}
  </div>;
}
