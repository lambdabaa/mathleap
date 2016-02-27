/* @flow */

import type {KeyboardEvent} from '../common/types';

function ctrlOrMeta(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

module.exports = ctrlOrMeta;
