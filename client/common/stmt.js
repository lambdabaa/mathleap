/* @flow */

exports.getStmtType = function(stmt: string): string {
  if (stmt.indexOf('=') !== -1) {
    return 'equation';
  }

  if (stmt.indexOf('>') !== -1 ||
      stmt.indexOf('<') !== -1 ||
      stmt.indexOf('≤') !== -1 ||
      stmt.indexOf('≥') !== -1) {
    return 'inequality';
  }

  return 'expression';
};

exports.getLeftAndRight = function(stmt: string): Object {
  let [left, right] = stmt.split(exports.getStmtSymbol(stmt));
  return {left, right};
};

exports.getStmtSplit = function(stmt: string): number {
  return stmt.indexOf(exports.getStmtSymbol(stmt));
};

exports.getStmtSymbol = function(stmt: string): string {
  return ['=', '>', '<', '≤', '≥'].find((candidate: string): boolean => {
    return stmt.indexOf(candidate) !== -1;
  });
};
