/* @flow */

let Xhr = require('./xhr');
let {edmodoApiUrl} = require('./constants');

import type {AccessToken} from '../common/types';

function Edmodo(token: AccessToken): void {
  this.token = token;
}

Edmodo.prototype = {
  getUser: async function(id: string = 'me'): Promise<Object> {
    let req = new Xhr();
    req.open('GET', `${edmodoApiUrl}/users/${id}/`, true);
    req.setRequestHeader('Authorization', `Bearer ${this.token.access_token}`);
    let res = await req.send();
    return JSON.parse(res);
  }
};

module.exports = Edmodo;
