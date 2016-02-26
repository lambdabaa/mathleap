const flatten = require('lodash/array/flatten');
const fs = require('mz/fs');
const values = require('lodash/object/values');

require('babel-polyfill');

async function main() {
  if (process.argv.length !== 5) {
    console.log('\n\tUsage: babel-node bin/stats.js [teachers-export.json] [classes-export.json] [students-export.json]\n');
  }

  let [
    teachers,
    classes,
    students
  ] = await Promise.all(
    process.argv.slice(2).map(async (arg) => {
      let file = await fs.readFile(arg, {encoding: 'utf-8'});
      return values(JSON.parse(file));
    })
  );

  let assigns = flatten(
    classes.map(aClass => {
      let {assignments} = aClass;
      if (!assignments) {
        return [];
      }

      return Object.values(assignments);
    })
  );

  let submits = flatten(
    assigns.map(assign => {
      let {submissions} = assign;
      if (!submissions) {
        return [];
      }

      return Object.values(submissions);
    })
  );

  let practices = flatten(
    students.map(student => {
      let {assignments} = student;
      if (!assignments) {
        return [];
      }

      return Object.values(assignments);
    })
  );

  let finishes = practices
    .map(practice => practice.submission)
    .filter(practice => practice.complete);

  console.log();
  console.log('Teachers:', teachers.length);
  console.log('Classes:', classes.length);
  console.log('Students:', students.length);
  console.log('Assignments:', assigns.length);
  console.log('Submissions:', submits.length);
  console.log('Practices:', practices.length);
  console.log('Completed practices:', finishes.length);
  console.log();
}

if (require.main === module) {
  main();
}
