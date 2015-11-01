let flatten = require('lodash/array/flatten');
let map = require('lodash/collection/map');
let range = require('lodash/utility/range');
let replaceIndex = require('./array').replaceIndex;

/**
 * @fileoverview Takes equations like
 *
 *     x^2+-x+x+10-1=0
 *     ________________
 *     0123456789012345
 *
 * and lists of deltas like
 *
 *    [
 *      {pos: 9, chr: 57, highlight: 13},  // 9
 *      {pos: 3, chr: 8, highlight: 8}     // backspace
 *    ]
 *
 * and returns two things
 *
 * (1) the result of applying the deltas (in this case x^2+9=0)
 * (2) data that we can use to render a view that shows what is changing
 *
 * @param {Object.<string, Array.<Object>>} statementToDeltas string equations
 *     to list of deltas to apply.
 */
exports.diff = function diff(statementToDeltas) {
  return {
    results: map(statementToDeltas, exports.applyDiff),
    changes: map(statementToDeltas, exports.getChanges)
  };
};

exports.applyDiff = function applyDiff(deltas, stmt) {
  if (deltas.length === 0) {
    return stmt;
  }

  let {pos, chr, highlight} = deltas[0];
  let tail = deltas.slice(1);
  let result;
  if (highlight) {
    result = chr === 8 ?
      stmt.slice(0, pos) + stmt.slice(highlight) :
      stmt.slice(0, pos) + String.fromCharCode(chr) + stmt.slice(highlight);
  } else {
    result = chr === 8 ?
      stmt.slice(0, pos - 1) + stmt.slice(pos) :
      stmt.slice(0, pos) + String.fromCharCode(chr) + stmt.slice(pos);
  }

  return applyDiff(tail, result);
};

exports.getChanges = function getChanges(deltas, stmt) {
  let {blocks} = deltas.reduce(
    (data, delta) => {
      let fn = delta.highlight ? handleHighlight : handleChar;
      let result = fn(data.blocks, data.cursor, delta);
      return 'cursor' in result ?
        result :
        {cursor: data.cursor, blocks: result};
    },
    {
      cursor: 0,
      blocks: [{type: 'none', range: [0, stmt.length], len: stmt.length}]
    }
  );

  return flatten(
    blocks.map(block => {
      return range(...block.range).map(() => block.type);
    })
  );
};

function handleHighlight(blocks, cursor, delta) {
  let {chr, pos, highlight} = delta;
  let selected = getSelectedBlocks(blocks, pos, highlight);
  let {block, index} = selected[0];
  let left = getBlockIndex(blocks, pos);
  let right = getBlockIndex(blocks, highlight);

  // NOTE: We need special treatment for the first and last selected blocks
  // since it's possible that we haven't highlighted the entirety of those.
  if (selected.length === 1) {
    if (block.type === 'highlight') {
      return handleHighlightSelection(blocks, index, left, right);
    }

    if (left === 0) {
      if (right === block.len) {
        return handleOuterSelection(blocks, index, chr);
      }

      // We only highlighted an incomplete left part of an untouched block.
      // The thing to do is to split it into two blocks.
      return handleLeftSelection(blocks, block, index, chr, right);
    }

    if (right === block.len) {
      // We only highlighted an incomplete right part of an untouched block.
      // The thing to do is to (again) split it into two blocks.
      return handleRightSelection(blocks, block, index, chr, left);
    }

    // The highlight didn't reach the left or right bounds so we need
    // three blocks.
    return handleInnerSelection(blocks, block, index, chr, left, right);
  }

  // Now we've ruled out the case where there was only one block selected so
  // we know that we start in one block and end in another.
  return selected.map((item, i) => {
    let {block, index} = item;
    if (i === 0) {
      // This could either be a right selection or an outer selection.
      if (block.type === 'highlight') {
        return handleHighlightSelection(block, left, block.len);
      }

      return left === 0 ?
        handleOuterSelection(block, chr) :
        handleRightSelection(blocks, block, index, chr, left);
    }

    if (i === selected.length - 1) {
      // This could either be a left selection or an outer selection.
      if (block.type === 'highlight') {
        return handleHighlightSelection(block, 0, right);
      }

      return right === block.len ?
        handleOuterSelection(block, chr) :
        handleRightSelection(blocks, block, index, chr, right);
    }

    // Now we know that this is an outer selection.
    if (block.type === 'highlight') {
      return handleHighlightSelection(block, 0, block.len);
    }

    return handleOuterSelection(block, chr);
  })[0];
}

/**
 * Handles highlighted block selections instead of untouched blocks.
 */
function handleHighlightSelection(blocks, index, left, right) {
  let block = blocks[index];
  let dist = right - left;
  return replaceIndex(blocks, index, {
    type: block.len === dist ? 'strikethrough' : block.type,
    range: block.range,
    len: block.len - dist
  });
}

/**
 * For the case when an entire block is selected.
 */
function handleOuterSelection(blocks, index, chr) {
  let block = blocks[index];
  return replaceIndex(
    blocks,
    index,
    chr === 8 ?
      {type: 'strikethrough', range: block.range, len: 0} :
      {type: 'highlight', range: block.range, len: 1}
  );
}

/**
 * For the case when the left side of a block is selected.
 */
function handleLeftSelection(blocks, block, index, chr, right) {
  let offspring;
  if (chr === 8) {
    offspring = {
      type: 'strikethrough',
      range: [block.range[0], block.range[0] + right],
      len: right
    };
  } else {
    offspring = {
      type: 'highlight',
      range: [block.range[0], block.range[0] + right],
      len: right + 1
    };
  }

  return {
    cursor: index + 1,
    blocks: replaceIndex(blocks, index, [
      {
        type: block.type,
        range: [block.range[0] + right, block.range[1]],
        len: block.len
      },
      offspring
    ])
  };
}

/**
 * For the case when the right side of a block is selected.
 */
function handleRightSelection(blocks, block, index, chr, left) {
  let offspring;
  if (chr === 8) {
    offspring = {
      type: 'strikethrough',
      range: [block.range[0] + left, block.range[1]],
      len: block.len - left
    };
  } else {
    offspring = {
      type: 'highlight',
      range: [block.range[0] + left, block.range[1]],
      len: block.len - left + 1
    };
  }

  return {
    cursor: index + 1,
    blocks: replaceIndex(blocks, index, [
      {
        type: block.type,
        range: [block.range[0], block.range[0] + left],
        len: block.len
      },
      offspring
    ])
  };
}

/**
 * For the case when only an inner slice of a block is selected.
 */
function handleInnerSelection(blocks, block, index, chr, left, right) {
  let leftSpawn = {
    type: 'none',
    range: [block.range[0], block.range[0] + left],
    len: left
  };

  let rightSpawn = {
    type: 'none',
    range: [block.range[0] + right, block.range[1]],
    len: block.len - right
  };

  let middleSpawn = chr === 8 ?
    {
      type: 'strikethrough',
      range: [block.range[0] + left, block.range[0] + right],
      len: right - left
    } :
    {
      type: 'highlight',
      range: [block.range[0] + left, block.range[0] + right],
      len: right - left + 1
    };

  return {
    cursor: index + 1,
    blocks: replaceIndex(blocks, index, [
      leftSpawn,
      middleSpawn,
      rightSpawn
    ])
  };
}

function handleChar(blocks, cursor, delta) {
  let block = blocks[cursor];
  let {chr, pos} = delta;
  if (chr === 8) {
    // There are 3 cases to think about for backspace no highlight.
    // len === 0: pretend we're highlighting one character to left
    // len === 1: current block type becomes st instead of highlight
    // len > 1: delete a character from the active block
    switch (block.len) {
      case 0:
        return handleHighlight(blocks, cursor, {
          pos: pos,
          chr: chr,
          highlight: pos + 1
        });
      case 1:
        return replaceIndex(blocks, cursor, {
          type: 'strikethrough',
          range: block.range,
          len: 0
        });
      default:
        return replaceIndex(blocks, cursor, {
          type: block.type,
          range: block.range,
          len: block.len - 1
        });
    }
  }

  // If it's not backspace then we just need to extend the active block.
  return replaceIndex(blocks, cursor, {
    type: 'highlight',
    range: block.range,
    len: block.len + 1
  });
}

/**
 * Find all of the blocks that land between the left and right bounds.
 */
function getSelectedBlocks(blocks, left, right) {
  let marker = 0;
  let results = [];
  blocks.forEach((block, index) => {
    let {len} = block;
    if (marker < right && marker + len >= left) {
      results.push({index, block});
    }

    marker += len;
  });

  return results;
}

/**
 * Normalize a position on the list of blocks to the block in which it lands.
 */
function getBlockIndex(blocks, marker) {
  for (let i = 0; i < blocks.length; i++) {
    let {len} = blocks[i];
    if (len > marker) {
      return marker;
    }

    marker -= len;
  }
}
