/* @flow */

let Xhr = require('./xhr');
let {edmodoApiUrl} = require('./constants');

import type {AccessToken} from '../common/types';

class Edmodo {
  token: AccessToken;

  constructor(token: AccessToken) {
    this.token = token;
  }

  getUser(id: string = 'me'): Promise<Object> {
    return this._fetchJSON(`users/${id}`);
  }

  getGroups(): Promise<Array<Object>> {
    return this._fetchJSONArray('groups');
  }

  getGroup(id: string): Promise<Object> {
    return this._fetchJSON(`groups/${id}`);
  }

  getGroupMemberships(groupId: string): Promise<Array<Object>> {
    return this._fetchJSONArray(`group_memberships?group_id=${groupId}`);
  }

  async _fetchJSON(path: string): Promise<Object> {
    let res = await this._fetch(path);
    return JSON.parse(res);
  }

  async _fetchJSONArray(path: string): Promise<Array<Object>> {
    let res = await this._fetch(path);
    return JSON.parse(res);
  }

  _fetch(path: string): Promise<string> {
    let req = new Xhr();
    req.open('GET', `${edmodoApiUrl}/${path}`, true /* async */);
    req.setRequestHeader('Authorization', `Bearer ${this.token.access_token}`);
    return req.send();
  }
}

module.exports = Edmodo;
