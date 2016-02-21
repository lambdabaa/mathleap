/* @flow */

let React = require('react');
let debug = require('../../common/debug')('components/Tabular');
let stringify = require('../../common/stringify');

module.exports = function(props: Object): React.Element {
  return <div className={`tabular ${props.className || ''}`}>
    <div className="tabular-headers">{getHeaders(props)}</div>
    <div className="tabular-rows">{getRows(props)}</div>
  </div>;
};

function getHeaders({cols}): React.Element {
  return cols.map((col, index) => {
    let style = {textAlign: 'left', width: `${100 / cols.length}%`};
    if (typeof col === 'object') {
      // width
      style.width = col.width && `${col.width}px` || style.width;
      style.textAlign = col.align || style.textAlign;
   }

    return <div key={index} className="tabular-header" style={style}>
      {
        typeof col === 'object' ? col.content : col
      }
    </div>;
  });
}

function getRows({cols, rows, selected}): React.Element {
  debug('getRows', stringify({cols, rows}));
  return rows.map((row, rowIndex) => getRow(row, rowIndex, cols, selected));
}

function getRow(row: Array<React.Element>|Object, rowIndex: number,
                cols: Array<?Object>, selected: number): React.Element {
  debug('getRow', stringify(arguments));
  let className = `tabular-row ${selected === rowIndex && 'selected'}`;
  let height, rowStyle, tab;
  if (!Array.isArray(row)) {
    height = row.height;
    rowStyle = {height};
    tab = row.tab;
    row = row.content;
  } else {
    rowStyle = {};
  }

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

function getCell(cell: React.Element, cellIndex: number,
                 cols: Array<?Object>): React.Element {
  let col = cols[cellIndex];
  let style = {textAlign: 'left', width: `${100 / cols.length}%`};
  if (col != null) {
    style.width = col.width && `${col.width}px` || style.width;
    style.textAlign = col.align || style.textAlign;
  }

  return <div key={cellIndex} className="tabular-cell" style={style}>
    {cell}
  </div>;
}
