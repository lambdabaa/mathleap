/* @flow */

let {googleApiKey} = require('./constants');
let waitFor = require('../common/waitFor');

import type {AccessToken} from '../common/types';

class Google {
  loading: Promise;
  token: AccessToken;

  constructor(token: AccessToken) {
    this.token = token;
  }

  async getUser(userId: string = 'me'): Promise<Object> {
    let client = await this.loadClient();
    let {result} = await client.plus.people.get({userId});
    return result;
  }

  loadClient(): Promise {
    return this.loading || this.load();
  }

  async load(): Promise {
    await waitFor(() => !!window.gapi);
    let {auth, client} = window.gapi;
    auth.setToken(this.token);
    client.setApiKey(googleApiKey);
    await client.load('plus', 'v1');
    return client;
  }
}

module.exports = Google;
