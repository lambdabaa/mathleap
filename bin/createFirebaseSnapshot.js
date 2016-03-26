#!/usr/bin/env node

let Moment = require('moment');
let {basename} = require('path');
let {exec} = require('mz/child_process');
let fs = require('fs');

require('babel-polyfill');

const fb = 'https://mathleap.firebaseio.com/v2';

async function main() {
  let flist = [];

  let statInterval = setInterval(() => {
    let stats = statAll(flist);
    console.log(JSON.stringify(stats));
  }, 500);

  await Promise.all([
    'classes',
    'students',
    'teachers'
  ].map(collection => {
    let date = new Moment().format('MM-DD-YY');
    let remote = `${fb}/${collection}/.json`;
    let local = `/home/gareth/Documents/mathleap-backups/${collection}-${date}.json`;
    flist.push(local);
    return exec(`curl ${remote} > ${local}`);
  }));

  clearInterval(statInterval);
}

function statAll(flist) {
  let results = {};
  flist.forEach(f => {
    let size;
    try {
      size = fs.statSync(f).size;
    } catch (error) {
      size = 0;
    }

    results[basename(f)] = size;
  });

  return results;
}

if (require.main === module) {
  main();
}
